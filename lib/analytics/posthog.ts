import "server-only";

const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;
const host = (
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com"
).replace("//us.i.", "//us.");

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
      next: { revalidate: 3600 },
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
