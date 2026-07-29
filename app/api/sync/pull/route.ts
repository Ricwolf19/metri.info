import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { event } from "@/lib/log/logger";
import { isValidationError, parseCursor } from "@/lib/sync/contract";
import { requireSyncAccess } from "@/lib/sync/guard";
import { pullSince } from "@/lib/sync/store";

/**
 * POST /api/sync/pull — premium only. Body: `{ since: string | null }` (the ISO
 * cursor from the previous pull). Returns one page of the caller's rows changed
 * since then, the new cursor, and `hasMore` — the client keeps pulling until
 * that clears.
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
  const parsed = parseCursor(body);
  if (isValidationError(parsed)) {
    return NextResponse.json(parsed, { status: 400 });
  }

  try {
    return NextResponse.json(await pullSince(access.userId, parsed.since));
  } catch (error) {
    event.error("sync.pull-failed", { userId: access.userId, error });
    Sentry.captureException(error);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
};
