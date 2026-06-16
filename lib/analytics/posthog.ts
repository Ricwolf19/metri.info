import "server-only";

import { POSTHOG_METRICS_TAG } from "@/lib/analytics/tags";

const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;
// Query API host (reads data back out). Kept separate from the client's ingest
// proxy: the browser sends events to `/ingest`, but server-side HogQL must hit
// PostHog's API host directly. Override with POSTHOG_API_HOST for non-US clouds.
const host = (process.env.POSTHOG_API_HOST || "https://us.posthog.com").replace(
  /\/$/,
  "",
);

export const posthogConfigured = () => Boolean(apiKey && projectId);

/** POST a HogQL query to the PostHog Query API and return `results` (a 2D array
 * of rows). Returns null when unconfigured or on any failure — the personal API
 * key never reaches the client and errors never bubble to the page. */
const runHogQL = async (query: string): Promise<unknown[] | null> => {
  if (!apiKey || !projectId) return null;
  try {
    const res = await fetch(`${host}/api/projects/${projectId}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
      next: { revalidate: 3600, tags: [POSTHOG_METRICS_TAG] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { results?: unknown[] };
    return json.results ?? null;
  } catch {
    return null;
  }
};

export type PageviewTotals = { last7: number; last30: number } | null;
export type TopPage = { path: string; views: number };

/** Pageview counts for the last 7 and 30 days from `$pageview` events. */
export const getPageviewTotals = async (): Promise<PageviewTotals> => {
  const rows = await runHogQL(
    `SELECT
       countIf(timestamp >= now() - INTERVAL 7 DAY) AS last7,
       countIf(timestamp >= now() - INTERVAL 30 DAY) AS last30
     FROM events
     WHERE event = '$pageview'`,
  );
  if (!rows || rows.length === 0) return null;
  const row = rows[0] as [number, number];
  return { last7: Number(row[0] ?? 0), last30: Number(row[1] ?? 0) };
};

export type CalcUsageTotals = { last7: number; last30: number } | null;
export type TopCalcUsage = { calculator: string; uses: number };

/** `calculator_used` event counts for the last 7 and 30 days — real usage
 * (anonymous + signed-in), counted in PostHog without any DB rows. */
export const getCalcUsageTotals = async (): Promise<CalcUsageTotals> => {
  const rows = await runHogQL(
    `SELECT
       countIf(timestamp >= now() - INTERVAL 7 DAY) AS last7,
       countIf(timestamp >= now() - INTERVAL 30 DAY) AS last30
     FROM events
     WHERE event = 'calculator_used'`,
  );
  if (!rows || rows.length === 0) return null;
  const row = rows[0] as [number, number];
  return { last7: Number(row[0] ?? 0), last30: Number(row[1] ?? 0) };
};

/** Top calculators by `calculator_used` events over the last 30 days. */
export const getTopCalcUsage = async (): Promise<TopCalcUsage[] | null> => {
  const rows = await runHogQL(
    `SELECT properties.calculator AS calculator, count() AS uses
     FROM events
     WHERE event = 'calculator_used'
       AND timestamp >= now() - INTERVAL 30 DAY
       AND calculator != ''
     GROUP BY calculator
     ORDER BY uses DESC
     LIMIT 10`,
  );
  if (!rows) return null;
  return (rows as [string, number][]).map((r) => ({
    calculator: r[0] ?? "",
    uses: Number(r[1] ?? 0),
  }));
};

/** Top pages by pageview over the last 30 days. */
export const getTopPages = async (): Promise<TopPage[] | null> => {
  const rows = await runHogQL(
    `SELECT properties.$pathname AS path, count() AS views
     FROM events
     WHERE event = '$pageview'
       AND timestamp >= now() - INTERVAL 30 DAY
       AND path != ''
     GROUP BY path
     ORDER BY views DESC
     LIMIT 10`,
  );
  if (!rows) return null;
  return (rows as [string, number][]).map((r) => ({
    path: r[0] ?? "/",
    views: Number(r[1] ?? 0),
  }));
};

export type TopEvent = { event: string; count: number };

/** Top event names over the last 30 days — surfaces the custom product events
 * (calculation_saved, favorite_toggled, share_clicked, …) alongside autocapture
 * so the admin can see what people actually do, not just pageviews. */
export const getTopEvents = async (): Promise<TopEvent[] | null> => {
  const rows = await runHogQL(
    `SELECT event, count() AS total
     FROM events
     WHERE timestamp >= now() - INTERVAL 30 DAY
       AND event NOT IN ('$pageview', '$pageleave', '$autocapture')
     GROUP BY event
     ORDER BY total DESC
     LIMIT 10`,
  );
  if (!rows) return null;
  return (rows as [string, number][]).map((r) => ({
    event: r[0] ?? "",
    count: Number(r[1] ?? 0),
  }));
};

export type FunnelStep = { label: string; count: number };

/**
 * Signup conversion funnel over the last 30 days, with a 7-day completion
 * window per person. `windowFunnel` returns the furthest IN-ORDER step each
 * person reached, so the counts strictly decrease and show where people drop:
 *   visited → used a calculator → reached sign-up → created account.
 */
export const getSignupFunnel = async (): Promise<FunnelStep[] | null> => {
  const rows = await runHogQL(
    `SELECT
       countIf(level >= 1) AS visited,
       countIf(level >= 2) AS used_calculator,
       countIf(level >= 3) AS reached_signup,
       countIf(level >= 4) AS signed_up
     FROM (
       SELECT
         person_id,
         windowFunnel(604800)(
           timestamp,
           event = '$pageview',
           event = 'calculator_used',
           event = '$pageview' AND (properties.$pathname = '/sign-up' OR properties.$pathname = '/es/registrarse'),
           event = 'signup_completed'
         ) AS level
       FROM events
       WHERE timestamp >= now() - INTERVAL 30 DAY
       GROUP BY person_id
     )`,
  );
  if (!rows || rows.length === 0) return null;
  const [visited, usedCalc, reachedSignup, signedUp] = (
    rows[0] as number[]
  ).map((n) => Number(n ?? 0));
  return [
    { label: "Visited", count: visited },
    { label: "Used a calculator", count: usedCalc },
    { label: "Reached sign-up", count: reachedSignup },
    { label: "Created account", count: signedUp },
  ];
};
