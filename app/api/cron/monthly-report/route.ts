import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { isCronRequest } from "@/lib/cron";
import { event } from "@/lib/log/logger";
import { sendMonthlyEmails } from "@/lib/reports/send";

export const maxDuration = 300;

/**
 * GET /api/cron/monthly-report: emails last month's report (or the tips
 * edition) to everyone who opted in. Runs on days 2, 3 and 4 (`vercel.json`):
 * Vercel Cron doesn't retry and can miss or duplicate a run, so the later days
 * are the retries, and starting on the 2nd gives phones time to sync. Same
 * `CRON_SECRET` guard as the purge, failing closed without the env var.
 */
export const GET = async (req: Request) => {
  if (!isCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json({ ok: true, ...(await sendMonthlyEmails()) });
  } catch (error) {
    event.error("monthly.run-failed", { error });
    Sentry.captureException(error);
    return NextResponse.json({ error: "monthly_failed" }, { status: 500 });
  }
};
