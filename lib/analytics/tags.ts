/**
 * Cache tags for `unstable_cache` / `revalidateTag`. Centralized so producers
 * (cached reads) and invalidators (server actions) can't drift apart.
 *
 * - `metrics:db`       — first-party Postgres admin aggregates (getDbMetrics).
 * - `metrics:posthog`  — PostHog HogQL admin queries.
 * - `favorites:<id>`   — one user's pinned list (built inline in favorites).
 */
export const DB_METRICS_TAG = "metrics:db";
export const POSTHOG_METRICS_TAG = "metrics:posthog";
