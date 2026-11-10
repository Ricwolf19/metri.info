import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { isCronRequest } from "@/lib/cron";
import { event } from "@/lib/log/logger";
import { purgeTombstones } from "@/lib/sync/store";

/**
 * GET /api/cron/purge-sync — daily tombstone purge, invoked by Vercel Cron
 * (see `vercel.json`), guarded by `isCronRequest`.
 */
export const GET = async (req: Request) => {
  if (!isCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const purged = await purgeTombstones();
    event.info("sync.tombstones-purged", { purged });
    return NextResponse.json({ ok: true, purged });
  } catch (error) {
    event.error("sync.purge-failed", { error });
    Sentry.captureException(error);
    return NextResponse.json({ error: "purge_failed" }, { status: 500 });
  }
};
