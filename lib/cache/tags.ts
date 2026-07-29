/**
 * Cache-tag registry — the single source of truth for every tag name in the
 * app. Producers (cached reads) and invalidators (server actions) both import
 * from here, so a rename can never leave one side pointing at a dead string.
 *
 * Per-user tags are functions so the id is always interpolated the same way.
 */
export const tags = {
  /** Admin dashboard aggregates, by upstream. */
  metrics: {
    /** First-party Postgres aggregates (`getDbMetrics`). */
    db: "metrics:db",
    /** PostHog HogQL queries. */
    posthog: "metrics:posthog",
    /** Sentry API reads (error volume, top issues). */
    sentry: "metrics:sentry",
    /** GA4 Data API reports. */
    ga: "metrics:ga",
  },
  /** One user's pinned list. */
  favorites: (userId: string) => `favorites:${userId}`,
} as const;
