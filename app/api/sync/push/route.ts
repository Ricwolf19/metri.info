import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { event } from "@/lib/log/logger";
import { isValidationError, parsePush } from "@/lib/sync/contract";
import { requireSyncAccess } from "@/lib/sync/guard";
import { applyPush } from "@/lib/sync/store";

/**
 * POST /api/sync/push — premium only. Body:
 *   { changes: PushRow[], deletions: PushDeletion[], deviceId?: string }
 *
 * Upserts the caller's rows into the mirror (Last-Write-Wins). The user comes
 * from the session, so a client can never write another user's data, and the
 * body is validated by `lib/sync/contract` before it reaches the database.
 */
export const POST = async (req: Request) => {
  const access = await requireSyncAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = parsePush(body, Date.now());
  if (isValidationError(parsed)) {
    return NextResponse.json(parsed, {
      status: parsed.error === "payload_too_large" ? 413 : 400,
    });
  }

  try {
    await applyPush(
      access.userId,
      parsed.rows,
      parsed.deletions,
      parsed.origin,
    );
  } catch (error) {
    // Reported, then flattened: this is the one endpoint that can corrupt a
    // user's data, and the client treats sync failures silently — so an
    // unreported 500 here would be invisible on both sides.
    event.error("sync.push-failed", { userId: access.userId, error });
    Sentry.captureException(error);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    count: parsed.rows.length + parsed.deletions.length,
  });
};
