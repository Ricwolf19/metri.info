import { NextResponse } from "next/server";

import { routePath } from "@/lib/i18n/routes";
import { event } from "@/lib/log/logger";
import {
  optOutOfReleaseEmails,
  verifyUnsubscribeToken,
} from "@/lib/releases/unsubscribe";

/**
 * The `List-Unsubscribe` target of release emails.
 *
 *   POST ?token=… → RFC 8058 one-click: opts the signed user out, 200.
 *   GET  ?token=… → 303 to the localized confirmation page. A GET never
 *                   unsubscribes: mail scanners prefetch links.
 */
export const POST = async (req: Request) => {
  const userId = verifyUnsubscribeToken(
    new URL(req.url).searchParams.get("token"),
  );
  if (!userId) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }
  try {
    await optOutOfReleaseEmails(userId);
  } catch (error) {
    event.error("release.unsubscribe-failed", { userId, error });
    return NextResponse.json({ error: "unsubscribe_failed" }, { status: 500 });
  }
  event.info("release.unsubscribed", { userId, via: "one-click" });
  return NextResponse.json({ ok: true });
};

export const GET = (req: Request) => {
  const url = new URL(req.url);
  const locale = url.searchParams.get("lang") === "es" ? "es" : "en";
  const target = new URL(routePath("unsubscribe", locale), url.origin);
  const token = url.searchParams.get("token");
  if (token) target.searchParams.set("token", token);
  return NextResponse.redirect(target, 303);
};
