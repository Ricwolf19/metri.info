import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { event } from "@/lib/log/logger";
import { purgeTombstones } from "@/lib/sync/store";

/**
 * GET /api/cron/purge-sync — daily tombstone purge, invoked by Vercel Cron
 * (see `vercel.json`). Auth is the `CRON_SECRET` bearer token Vercel attaches
 * to cron requests; without the env var the route fails closed, so a fresh
 * deploy without the secret can't be triggered by strangers.
 */
export const GET = async (req: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
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
