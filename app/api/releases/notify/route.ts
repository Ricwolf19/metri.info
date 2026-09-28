import { createHash, timingSafeEqual } from "node:crypto";

import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { event } from "@/lib/log/logger";
import { TAG_RE } from "@/lib/releases/github";
import { notifyRelease } from "@/lib/releases/notify";

// GitHub fetch + a few thousand recipients in 100-message batches paced
// 600 ms apart: seconds in practice, well under Vercel's cap.
export const maxDuration = 60;

/** Hash both sides first so the compare is constant-time regardless of the
 * presented value's length. */
const bearerMatches = (header: string | null, secret: string): boolean => {
  const presented = header?.startsWith("Bearer ") ? header.slice(7) : "";
  const a = createHash("sha256").update(presented).digest();
  const b = createHash("sha256").update(secret).digest();
  return presented.length > 0 && timingSafeEqual(a, b);
};

const STATUS_BY_REASON = {
  invalid: 422,
  not_found: 404,
  unavailable: 502,
} as const;

/**
 * POST /api/releases/notify — called by the mobile repo's release workflow
 * once `release.json` and the APK are attached to the tagged release.
 *
 *   Authorization: Bearer <RELEASE_WEBHOOK_SECRET>
 *   { "tag": "metri-v1.12.0" }
 *
 * Only the tag is read from the body; everything stored comes from GitHub.
 * Fails closed (503) while the secret is unset. Idempotent per tag — see
 * `notifyRelease`.
 */
export const POST = async (req: Request) => {
  const secret = process.env.RELEASE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (!bearerMatches(req.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json().catch(() => null);
  const tag =
    typeof body === "object" && body !== null && "tag" in body
      ? body.tag
      : null;
  if (typeof tag !== "string" || !TAG_RE.test(tag)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const outcome = await notifyRelease(tag);
    if (!outcome.ok) {
      return NextResponse.json(
        { error: `release_${outcome.reason}` },
        { status: STATUS_BY_REASON[outcome.reason] },
      );
    }
    return NextResponse.json({ stored: true, emailed: outcome.emailed });
  } catch (error) {
    event.error("release.notify-failed", { tag, error });
    Sentry.captureException(error);
    return NextResponse.json({ error: "notify_failed" }, { status: 500 });
  }
};
