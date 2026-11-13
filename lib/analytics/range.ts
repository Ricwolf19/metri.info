/**
 * The date window every analytics dashboard reads from the URL: a preset
 * (`?range=7d|30d|90d|365d`) or a custom span (`?from=YYYY-MM-DD&to=…`, either
 * end optional). Days are inclusive calendar days in `ANALYTICS_TIME_ZONE`, the
 * operator's clock, so "today" and the hour grids agree with the wall.
 *
 * Pure: the caller passes `today`, so tests and cached reads never touch the
 * clock.
 */

/** Where the operator lives. PostHog days and hours are grouped in it; GA4
 * uses its property's own zone and Search Console uses Pacific time, and the
 * pages that show them say so. */
export const ANALYTICS_TIME_ZONE = "America/Mexico_City";
/** How the dashboards name that clock. */
export const ANALYTICS_ZONE_LABEL = "Mexico City";

export const RANGE_PRESETS = ["7d", "30d", "90d", "365d"] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

const PRESET_DAYS: Record<RangePreset, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

export const PRESET_LABEL: Record<RangePreset, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "365d": "12 months",
};

const DEFAULT_PRESET: RangePreset = "30d";

/** A custom span longer than this is cut at its start. */
export const MAX_RANGE_DAYS = 480;

export type AnalyticsWindow = {
  preset: RangePreset | "custom";
  /** Inclusive, `YYYY-MM-DD`. */
  startDate: string;
  endDate: string;
  days: number;
};

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar day (rejects `2026-02-30`). */
const isDay = (v: unknown): v is string =>
  typeof v === "string" &&
  DAY_RE.test(v) &&
  new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;

export const shiftDay = (day: string, n: number): string => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const daysBetween = (start: string, end: string): number =>
  Math.round(
    (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
      86_400_000,
  ) + 1;

/** Today's date on the operator's clock. */
export const todayIn = (timeZone: string, now: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

const presetWindow = (preset: RangePreset, today: string): AnalyticsWindow => {
  const days = PRESET_DAYS[preset];
  return {
    preset,
    startDate: shiftDay(today, -(days - 1)),
    endDate: today,
    days,
  };
};

/** The last `days` days up to `today`, for a card with a fixed span. */
export const lastDays = (days: number, today: string): AnalyticsWindow => ({
  preset: "custom",
  startDate: shiftDay(today, -(days - 1)),
  endDate: today,
  days,
});

/** The window a dashboard URL asks for. A valid `from` or `to` wins over
 * `range`; a reversed span is swapped; nothing runs past today. */
export const parseRange = (
  params: SearchParams,
  today: string,
): AnalyticsWindow => {
  const from = first(params.from);
  const to = first(params.to);
  if (isDay(from) || isDay(to)) {
    const clampToday = (d: string) => (d > today ? today : d);
    let end = isDay(to) ? clampToday(to) : today;
    let start = isDay(from)
      ? clampToday(from)
      : shiftDay(end, -(PRESET_DAYS[DEFAULT_PRESET] - 1));
    if (start > end) [start, end] = [end, start];
    const earliest = shiftDay(end, -(MAX_RANGE_DAYS - 1));
    if (start < earliest) start = earliest;
    return {
      preset: "custom",
      startDate: start,
      endDate: end,
      days: daysBetween(start, end),
    };
  }
  const raw = first(params.range);
  const preset = RANGE_PRESETS.find((p) => p === raw) ?? DEFAULT_PRESET;
  return presetWindow(preset, today);
};

/** The last `maxDays` of a window, for an upstream that keeps less history
 * (PostHog heatmaps, Sentry stats). */
export const clampWindow = (
  window: AnalyticsWindow,
  maxDays: number,
): { window: AnalyticsWindow; clamped: boolean } => {
  if (window.days <= maxDays) return { window, clamped: false };
  return {
    window: {
      ...window,
      startDate: shiftDay(window.endDate, -(maxDays - 1)),
      days: maxDays,
    },
    clamped: true,
  };
};

/**
 * The query string for a link that changes some params and keeps the rest.
 * `null` deletes a key; the default preset is dropped so the bare path stays
 * canonical. Returns `""` or `"?…"`.
 */
export const searchWith = (
  params: SearchParams,
  patch: Record<string, string | null>,
): string => {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = first(value);
    if (v !== undefined && !(key in patch)) out.set(key, v);
  }
  for (const [key, value] of Object.entries(patch))
    if (value !== null) out.set(key, value);
  if (out.get("range") === DEFAULT_PRESET) out.delete("range");
  const s = out.toString();
  return s ? `?${s}` : "";
};

/** "Nov 12", or "Nov 12, 2026" with the year. */
export const dayLabel = (day: string, withYear = false) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });

/** "Last 30 days", or "Oct 3 – Nov 12, 2026" for a custom span. */
export const windowLabel = (window: AnalyticsWindow): string => {
  if (window.preset !== "custom") return `Last ${PRESET_LABEL[window.preset]}`;
  if (window.startDate === window.endDate)
    return dayLabel(window.endDate, true);
  const sameYear = window.startDate.slice(0, 4) === window.endDate.slice(0, 4);
  return `${dayLabel(window.startDate, !sameYear)} – ${dayLabel(window.endDate, true)}`;
};

/** Every day of the window, oldest first, with `values` filled in and gaps
 * at zero — so a chart never has to check for a missing day. */
export const fillDays = (
  window: Pick<AnalyticsWindow, "startDate" | "days">,
  values: ReadonlyMap<string, number>,
): { date: string; value: number }[] =>
  Array.from({ length: window.days }, (_, i) => {
    const date = shiftDay(window.startDate, i);
    return { date, value: values.get(date) ?? 0 };
  });
