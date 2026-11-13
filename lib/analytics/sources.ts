import "server-only";

import { gaConfigured } from "./ga";
import { posthogConfigured } from "./posthog";
import { searchConsoleConfigured } from "./search-console";
import { sentryConfigured } from "./sentry";
import { simulating } from "./simulate";

/**
 * The four upstreams behind /admin, what each needs, and whether it has it.
 * A card asks here before rendering, so an unset key reads "connect it" (or,
 * on a dev server, shows simulated data), and a set one that failed reads
 * "didn't answer" — a blank is never mistaken for zero.
 */
export const SOURCES = {
  posthog: {
    label: "PostHog",
    configured: posthogConfigured,
    setup:
      "Set POSTHOG_PERSONAL_API_KEY (scope query:read) and POSTHOG_PROJECT_ID.",
  },
  ga: {
    label: "Google Analytics",
    configured: gaConfigured,
    setup:
      "Set GA4_PROPERTY_ID and GA4_CREDENTIALS_JSON (a service account with Viewer on the property).",
  },
  gsc: {
    label: "Search Console",
    configured: searchConsoleConfigured,
    setup:
      "Set GSC_SITE_URL and add the GA4_CREDENTIALS_JSON service account as a user on the Search Console property.",
  },
  sentry: {
    label: "Sentry",
    configured: sentryConfigured,
    setup:
      "Set SENTRY_API_TOKEN (a user token with event:read, project:read and org:read).",
  },
} as const;

export type AnalyticsSource = keyof typeof SOURCES;

/** `live` with keys; `simulated` on a dev server without them (made-up
 * data, badged on every card); `off` anywhere else without them. */
export type SourceMode = "live" | "simulated" | "off";

export const sourceMode = (source: AnalyticsSource): SourceMode => {
  const configured = SOURCES[source].configured();
  if (configured) return "live";
  return simulating(configured) ? "simulated" : "off";
};
