/**
 * Sentry client SDK — runs in the browser.
 *
 * Sample rates are tuned for low-cost observability without drowning the issue
 * feed: 1.0 in development for fast feedback, 0.1 in production by default so a
 * typical day of traffic stays well inside the free tier. Replay / Feedback are
 * left off for now (commented-out hook in `withSentryConfig` reminds us where
 * to re-enable them); Logs are on so our structured logger can also pipe into
 * Sentry's "Logs" view.
 *
 * DSN resolution: prefer an env var (so we can rotate projects without a code
 * deploy); fall back to `undefined` so Sentry no-ops cleanly in environments
 * where the var isn't set (e.g. CI preview deploys).
 */
import * as Sentry from "@sentry/nextjs";

const dsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN ?? undefined;

Sentry.init({
  dsn,
  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  enableLogs: true,
  // Benign network noise, not actionable bugs: cancelled RSC prefetches, ad
  // blockers dropping analytics/tunnel requests, brief offline states. These
  // surface as unhandled "Failed to fetch" rejections from Sentry's own fetch
  // instrumentation and would otherwise drown the issue feed.
  ignoreErrors: [
    /Failed to fetch/i,
    /Load failed/i,
    /NetworkError when attempting to fetch/i,
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
