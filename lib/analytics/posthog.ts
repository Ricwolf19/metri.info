import "server-only";

import { createApiClient } from "@/lib/cache/api";
import { tags } from "@/lib/cache/tags";

const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;
// Query API host (reads data back out). Kept separate from the client's ingest
// proxy: the browser sends events to `/relay`, but server-side HogQL must hit
// PostHog's API host directly. Override with POSTHOG_API_HOST for non-US clouds.
const host = (process.env.POSTHOG_API_HOST || "https://us.posthog.com").replace(
  /\/$/,
  "",
);

export const posthogConfigured = () => Boolean(apiKey && projectId);

const api = createApiClient({
  baseUrl: host,
  tag: tags.metrics.posthog,
  headers: () =>
    apiKey && projectId
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        }
      : null,
});

/** POST a HogQL query to the PostHog Query API and return `results` (a 2D array
 * of rows). Returns null when unconfigured or on any failure — the personal API
 * key never reaches the client and errors never bubble to the page. */
const runHogQL = async (query: string): Promise<unknown[] | null> => {
  const json = await api.request<{ results?: unknown[] }>(
    `/api/projects/${projectId}/query`,
    {
      method: "POST",
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    },
  );
  return json?.results ?? null;
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

export type DayCount = { date: string; count: number };

/** Pageviews per day for the last `days` days (UTC), oldest first, gaps
 * filled with zero so a calendar can lay them out without checking. */
export const getDailyPageviews = async (
  days = 84,
): Promise<DayCount[] | null> => {
  const rows = await runHogQL(
    `SELECT toDate(timestamp) AS day, count() AS views
     FROM events
     WHERE event = '$pageview'
       AND timestamp >= now() - INTERVAL ${Math.max(1, Math.min(366, days))} DAY
     GROUP BY day
     ORDER BY day`,
  );
  if (!rows) return null;
  const map = new Map(
    (rows as [string, number][]).map((r) => [
      String(r[0]).slice(0, 10),
      Number(r[1] ?? 0),
    ]),
  );
  const out: DayCount[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
};

/** Pageviews by weekday (1 = Monday … 7 = Sunday) and hour of day, UTC,
 * over the last `days` days: `cells[dow - 1][hour]`. */
export const getHourlyPageviews = async (
  days = 30,
): Promise<number[][] | null> => {
  const rows = await runHogQL(
    `SELECT toDayOfWeek(timestamp) AS dow, toHour(timestamp) AS hour, count() AS views
     FROM events
     WHERE event = '$pageview'
       AND timestamp >= now() - INTERVAL ${Math.max(1, Math.min(366, days))} DAY
     GROUP BY dow, hour
     ORDER BY dow, hour`,
  );
  if (!rows) return null;
  const cells = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const r of rows as [number, number, number][]) {
    const dow = Number(r[0]);
    const hour = Number(r[1]);
    if (dow >= 1 && dow <= 7 && hour >= 0 && hour < 24)
      cells[dow - 1][hour] = Number(r[2] ?? 0);
  }
  return cells;
};
