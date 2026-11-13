import { type AnalyticsWindow, daysBetween, shiftDay } from "./range";

/**
 * Pure side of the Search Console dashboard: the window Google has final data
 * for, row parsing, the "where clicks are being left" opportunities and the
 * index-coverage grouping of URL inspections. `search-console.ts` fetches.
 */

/** Search Console finalizes a day about three days after it ends. */
export const SEARCH_CONSOLE_LAG_DAYS = 3;

/** The requested window, slid back so it ends on the last final day; the
 * length is kept, so "last 7 days" is still seven days of data. */
export const searchWindow = (
  window: AnalyticsWindow,
  today: string,
): { window: AnalyticsWindow; shifted: boolean } => {
  const lastFinal = shiftDay(today, -SEARCH_CONSOLE_LAG_DAYS);
  if (window.endDate <= lastFinal) return { window, shifted: false };
  const back = daysBetween(lastFinal, window.endDate) - 1;
  return {
    window: {
      ...window,
      startDate: shiftDay(window.startDate, -back),
      endDate: lastFinal,
    },
    shifted: true,
  };
};

export type SearchRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  /** 0..1 */
  ctr: number;
  /** Average position, 1 = top. */
  position: number;
};

const num = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? v : 0;

export const parseSearchRows = (json: unknown): SearchRow[] => {
  const rows = (json as { rows?: unknown } | null)?.rows;
  if (!Array.isArray(rows)) return [];
  return rows.map((r: Record<string, unknown>) => ({
    keys: Array.isArray(r.keys) ? r.keys.map(String) : [],
    clicks: num(r.clicks),
    impressions: num(r.impressions),
    ctr: num(r.ctr),
    position: num(r.position),
  }));
};

/** What a result at this position usually earns. A rough public curve, good
 * enough to rank opportunities, not to forecast traffic. */
const expectedCtr = (position: number): number => {
  if (position < 1.5) return 0.28;
  if (position < 2.5) return 0.15;
  if (position < 3.5) return 0.1;
  if (position < 5.5) return 0.06;
  if (position < 10.5) return 0.03;
  if (position < 20.5) return 0.01;
  return 0.005;
};

export type Opportunity = SearchRow & { gain: number };

/** On page one but clicked well under par: the title or snippet isn't
 * winning the click. `gain` is the clicks par would have brought. */
export const underperforming = (rows: readonly SearchRow[]): Opportunity[] =>
  rows
    .filter(
      (r) =>
        r.impressions >= 20 &&
        r.position > 0 &&
        r.position <= 10.5 &&
        r.ctr < expectedCtr(r.position) / 2,
    )
    .map((r) => ({
      ...r,
      gain: Math.round(r.impressions * expectedCtr(r.position) - r.clicks),
    }))
    .sort((a, b) => b.gain - a.gain || b.impressions - a.impressions)
    .slice(0, 10);

/** Ranking 8–20: a little more relevance moves it onto page one or up it.
 * `gain` is what the same impressions would earn at #3. */
export const strikingDistance = (rows: readonly SearchRow[]): Opportunity[] =>
  rows
    .filter((r) => r.position >= 8 && r.position <= 20 && r.impressions >= 5)
    .map((r) => ({
      ...r,
      gain: Math.max(0, Math.round(r.impressions * expectedCtr(3) - r.clicks)),
    }))
    .sort((a, b) => b.impressions - a.impressions || a.position - b.position)
    .slice(0, 10);

/** `https://metri.info/es/docs/x` → `/es/docs/x`. */
export const pagePath = (url: string): string => {
  try {
    const u = new URL(url);
    return `${u.pathname}${u.search}` || "/";
  } catch {
    return url;
  }
};

const DEVICES: Record<string, string> = {
  MOBILE: "Mobile",
  DESKTOP: "Desktop",
  TABLET: "Tablet",
};
export const deviceName = (key: string) => DEVICES[key] ?? key;

export type Sitemap = {
  path: string;
  isIndex: boolean;
  submitted: number;
  errors: number;
  warnings: number;
  isPending: boolean;
  lastDownloaded: string | null;
  lastSubmitted: string | null;
};

export const parseSitemaps = (json: unknown): Sitemap[] => {
  const list = (json as { sitemap?: unknown } | null)?.sitemap;
  if (!Array.isArray(list)) return [];
  return list.map((s: Record<string, unknown>) => ({
    path: String(s.path ?? ""),
    isIndex: s.isSitemapsIndex === true,
    // int64 fields arrive as strings.
    submitted: Array.isArray(s.contents)
      ? s.contents.reduce(
          (n: number, c: { submitted?: unknown }) =>
            n + Number(c.submitted ?? 0),
          0,
        )
      : 0,
    errors: Number(s.errors ?? 0),
    warnings: Number(s.warnings ?? 0),
    isPending: s.isPending === true,
    lastDownloaded:
      typeof s.lastDownloaded === "string" ? s.lastDownloaded : null,
    lastSubmitted: typeof s.lastSubmitted === "string" ? s.lastSubmitted : null,
  }));
};

export type SitemapStatus = "errors" | "pending" | "warnings" | "ok";
export const sitemapStatus = (s: Sitemap): SitemapStatus =>
  s.errors > 0
    ? "errors"
    : s.isPending
      ? "pending"
      : s.warnings > 0
        ? "warnings"
        : "ok";

// ── Index coverage (URL Inspection) ────────────────────────────────────────

export type Inspection = {
  url: string;
  /** PASS, NEUTRAL, PARTIAL, FAIL — Google's own verdict on the URL. */
  verdict: string;
  /** The Page indexing report's wording, e.g. "Discovered - currently not indexed". */
  coverage: string;
  lastCrawl: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  robots: string | null;
  fetch: string | null;
};

export const parseInspection = (
  url: string,
  json: unknown,
): Inspection | null => {
  const r = (
    json as {
      inspectionResult?: { indexStatusResult?: Record<string, unknown> };
    } | null
  )?.inspectionResult?.indexStatusResult;
  if (!r) return null;
  const s = (v: unknown) => (typeof v === "string" && v ? v : null);
  return {
    url,
    verdict: s(r.verdict) ?? "VERDICT_UNSPECIFIED",
    coverage: s(r.coverageState) ?? "Unknown",
    lastCrawl: s(r.lastCrawlTime),
    googleCanonical: s(r.googleCanonical),
    userCanonical: s(r.userCanonical),
    robots: s(r.robotsTxtState),
    fetch: s(r.pageFetchState),
  };
};

export const isIndexed = (i: Inspection) => i.verdict === "PASS";

/** URLs grouped by coverage state, the biggest group first: the same buckets
 * as the Page indexing report, per URL instead of a sample. */
export const coverageGroups = (
  inspections: readonly Inspection[],
): { coverage: string; indexed: boolean; urls: Inspection[] }[] => {
  const groups = new Map<string, Inspection[]>();
  for (const i of inspections) {
    const list = groups.get(i.coverage) ?? [];
    list.push(i);
    groups.set(i.coverage, list);
  }
  return [...groups.entries()]
    .map(([coverage, urls]) => ({
      coverage,
      indexed: urls.every(isIndexed),
      urls: urls.sort((a, b) => a.url.localeCompare(b.url)),
    }))
    .sort((a, b) => b.urls.length - a.urls.length);
};

/** A canonical Google chose over ours: the usual reason a page is "Duplicate,
 * Google chose different canonical". */
export const canonicalMismatch = (i: Inspection) =>
  i.googleCanonical !== null &&
  i.userCanonical !== null &&
  i.googleCanonical !== i.userCanonical;
