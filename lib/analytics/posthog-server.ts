import "server-only";

import { PostHog } from "posthog-node";

/**
 * Server-side PostHog capture for events the client can't observe reliably —
 * notably `signup_completed`, fired from a Better Auth DB hook so it counts
 * email AND social account creation uniformly (the client can't tell a new
 * social user from a returning one).
 *
 * Uses the public project key (same `NEXT_PUBLIC_POSTHOG_KEY` the browser uses;
 * it's an ingestion key, not a secret) and posts straight to PostHog's US
 * ingestion host — no ad-blocker proxy needed server-side. A true no-op when the
 * key is absent, so local/unconfigured runs stay clean.
 */
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.POSTHOG_INGEST_HOST || "https://us.i.posthog.com";

let client: PostHog | null = null;

const getClient = (): PostHog | null => {
  if (!key) return null;
  if (!client) {
    // flushAt:1 / flushInterval:0 → send immediately; serverless can freeze
    // between requests, so we never want events sitting in a buffer.
    client = new PostHog(key, { host, flushAt: 1, flushInterval: 0 });
  }
  return client;
};

export const captureServer = async (
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> => {
  const c = getClient();
  if (!c) return;
  try {
    c.capture({ distinctId, event, properties });
    await c.flush();
  } catch {
    // analytics must never break the request it's piggybacking on
  }
};
