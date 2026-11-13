import { type AnalyticsWindow, clampWindow, shiftDay } from "./range";

/**
 * Pure side of the Sentry dashboard: the period Sentry is asked for and the
 * shapes it answers in. `sentry.ts` fetches.
 */

/** Sentry's stats and issue search go back 90 days on the plans we use. */
export const SENTRY_MAX_DAYS = 90;

/** Relative (`statsPeriod=30d`) when the window runs to today, so Sentry's
 * own "now" is the end; explicit start/end otherwise. */
export const sentryPeriod = (
  requested: AnalyticsWindow,
  today: string,
): { query: string; window: AnalyticsWindow; clamped: boolean } => {
  const { window, clamped } = clampWindow(requested, SENTRY_MAX_DAYS);
  const query =
    window.endDate >= today
      ? `statsPeriod=${window.days}d`
      : `start=${window.startDate}T00:00:00&end=${shiftDay(window.endDate, 1)}T00:00:00`;
  return { query, window, clamped };
};

type StatsV2 = {
  intervals?: unknown;
  groups?: {
    totals?: Record<string, unknown>;
    series?: Record<string, unknown>;
  }[];
};

const FIELD = "sum(quantity)";

export const statsTotal = (json: unknown): number =>
  ((json as StatsV2 | null)?.groups ?? []).reduce(
    (n, g) => n + Number(g.totals?.[FIELD] ?? 0),
    0,
  );

/** Events per interval start day (`YYYY-MM-DD`), summed across groups. */
export const statsSeries = (json: unknown): Map<string, number> => {
  const data = json as StatsV2 | null;
  const intervals = Array.isArray(data?.intervals) ? data.intervals : [];
  const out = new Map<string, number>();
  for (const g of data?.groups ?? []) {
    const series = g.series?.[FIELD];
    if (!Array.isArray(series)) continue;
    intervals.forEach((at, i) => {
      const day = String(at).slice(0, 10);
      out.set(day, (out.get(day) ?? 0) + Number(series[i] ?? 0));
    });
  }
  return out;
};

export type SentryIssue = {
  id: string;
  shortId: string;
  title: string;
  culprit: string;
  level: string;
  count: number;
  users: number;
  firstSeen: string;
  lastSeen: string;
  /** Only an https link to Sentry survives parsing. */
  permalink: string | null;
};

export const parseIssues = (json: unknown): SentryIssue[] | null => {
  if (!Array.isArray(json)) return null;
  return json.map((i: Record<string, unknown>) => {
    const permalink = typeof i.permalink === "string" ? i.permalink : "";
    return {
      id: String(i.id ?? ""),
      shortId: String(i.shortId ?? ""),
      title: String(i.title ?? "(untitled)"),
      culprit: String(i.culprit ?? ""),
      level: String(i.level ?? "error"),
      count: Number(i.count ?? 0),
      users: Number(i.userCount ?? 0),
      firstSeen: String(i.firstSeen ?? ""),
      lastSeen: String(i.lastSeen ?? ""),
      permalink: permalink.startsWith("https://") ? permalink : null,
    };
  });
};

/** Discover rows (`?field=x&field=count()`) as label/value pairs. A release
 * that is a commit SHA prints short. */
export const parseDiscover = (
  json: unknown,
  field: string,
): { label: string; value: number }[] | null => {
  const data = (json as { data?: unknown } | null)?.data;
  if (!Array.isArray(data)) return null;
  return data.map((row: Record<string, unknown>) => {
    const raw = String(row[field] ?? "");
    return {
      label: /^[0-9a-f]{12,40}$/i.test(raw)
        ? raw.slice(0, 7)
        : raw || "(not set)",
      value: Number(row["count()"] ?? 0),
    };
  });
};
