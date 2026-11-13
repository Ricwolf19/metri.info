import { ANALYTICS_TIME_ZONE } from "./range";

/** How the admin dashboards print a number. Rates arrive as 0..1 ratios. */
export type MetricFormat = "number" | "percent" | "duration" | "position";

export const formatMetric = (
  value: number,
  format: MetricFormat = "number",
) => {
  switch (format) {
    case "percent":
      return `${(value * 100).toFixed(value > 0 && value < 0.1 ? 1 : 0)}%`;
    case "duration": {
      const s = Math.round(value);
      if (s < 60) return `${s}s`;
      if (s < 3600)
        return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
      return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
    }
    case "position":
      return value > 0 ? value.toFixed(1) : "—";
    default:
      return Math.round(value).toLocaleString("en-US");
  }
};

/** `part` as a share of `whole`, or null when there's nothing to divide. */
export const ratio = (part: number, whole: number): number | null =>
  whole > 0 ? part / whole : null;

/** An instant on the operator's clock, like every other date on the
 * dashboards: "Nov 12, 2026", or "Nov 12, 14:05" with `time`. */
export const formatInstant = (iso: string | null, time = false): string => {
  if (!iso || Number.isNaN(Date.parse(iso))) return "—";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: ANALYTICS_TIME_ZONE,
    month: "short",
    day: "numeric",
    ...(time
      ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }
      : { year: "numeric" }),
  });
};
