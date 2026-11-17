import "server-only";

import { getDocSlugs } from "@/lib/docs";
import { ROUTES } from "@/lib/i18n/routes";
import { siteUrl } from "@/lib/utils";

import { IN_WINDOW, posthogSimulated, windowValues } from "./behavior";
import {
  type HeatFold,
  type HeatPoint,
  type HeatZone,
  type ScrollBucket,
  ZONE_COLS,
  ZONE_ROW_PX,
} from "./heat";
import {
  HEATMAP_POINT_LIMIT,
  type HeatmapParams,
  heatmapUrlPattern,
} from "./heatmaps";
import { runHogQL, toBool, toNum, toStr, type HogValues } from "./posthog";
import { type AnalyticsWindow, shiftDay } from "./range";
import {
  simHeatFold,
  simHeatPoints,
  simHeatZones,
  simScrollDepth,
} from "./simulate";

/**
 * Heatmap reads, straight from PostHog's `heatmaps` table in HogQL (the same
 * `query:read` key as every other card; no extra scope). The expressions
 * mirror PostHog's own heatmap API: x as a share of the viewport width, y back
 * in CSS px, viewport filters on the stored /16 units. Test accounts are not
 * filtered out; the admin's own visits are, because tracking never starts
 * inside the preview frame (`readConsent`).
 */

const host = new URL(siteUrl).host.replace(/^www\./, "");

const values = (p: HeatmapParams, w: AnalyticsWindow): HogValues => ({
  type: p.map.id,
  // Heatmap rows are bucketed by UTC timestamp; the `Z` keeps a bare date
  // from being read in the project's zone.
  start: `${w.startDate}T00:00:00Z`,
  end: `${shiftDay(w.endDate, 1)}T00:00:00Z`,
  vw_min: p.device.minScaled,
  vw_max: p.device.maxScaled ?? 1_000_000,
  url_pattern: heatmapUrlPattern(p.page, host),
});

const WHERE = `type = {type}
  AND timestamp >= toDateTime({start})
  AND timestamp < toDateTime({end})
  AND viewport_width >= {vw_min}
  AND viewport_width <= {vw_max}
  AND match(current_url, {url_pattern})`;

/** An event with no position (0, 0) is a capture artefact, not a click in
 * the corner. Scroll depth rows have no pointer, so they keep it. */
const HAS_POINTER = `NOT (x = 0 AND y = 0)`;

const count = (p: HeatmapParams) =>
  p.agg === "unique" ? "count(DISTINCT distinct_id)" : "count()";

export const getHeatPoints = async (
  p: HeatmapParams,
  w: AnalyticsWindow,
): Promise<HeatPoint[] | null> => {
  if (posthogSimulated()) return simHeatPoints(p, w);
  const rows = await runHogQL(
    `SELECT pointer_target_fixed,
       round(x / viewport_width, 2) AS rel_x,
       y * scale_factor AS pointer_y,
       ${count(p)} AS cnt
     FROM heatmaps
     WHERE ${WHERE} AND ${HAS_POINTER}
     GROUP BY pointer_target_fixed, rel_x, pointer_y
     ORDER BY cnt DESC
     LIMIT ${HEATMAP_POINT_LIMIT}`,
    values(p, w),
  );
  if (!rows) return null;
  return rows.map((r) => ({
    fixed: toBool(r[0]),
    x: Math.min(1, Math.max(0, toNum(r[1]))),
    y: Math.max(0, toNum(r[2])),
    count: toNum(r[3]),
  }));
};

/** Interactions and distinct visitors per hover zone (`ZONE_COLS` columns
 * across, `ZONE_ROW_PX` rows down), for the preview's tooltip. */
export const getHeatZones = async (
  p: HeatmapParams,
  w: AnalyticsWindow,
): Promise<HeatZone[] | null> => {
  if (posthogSimulated()) return simHeatZones(p, w);
  const rows = await runHogQL(
    `SELECT pointer_target_fixed,
       least(${ZONE_COLS - 1}, greatest(0, toInt(floor(x / viewport_width * ${ZONE_COLS})))) AS zone_col,
       toInt(floor(y * scale_factor / ${ZONE_ROW_PX})) AS zone_row,
       count() AS cnt,
       count(DISTINCT distinct_id) AS people
     FROM heatmaps
     WHERE ${WHERE} AND ${HAS_POINTER}
     GROUP BY pointer_target_fixed, zone_col, zone_row
     ORDER BY cnt DESC
     LIMIT ${HEATMAP_POINT_LIMIT}`,
    values(p, w),
  );
  if (!rows) return null;
  return rows.map((r) => ({
    fixed: toBool(r[0]),
    col: Math.min(ZONE_COLS - 1, Math.max(0, toNum(r[1]))),
    row: Math.max(0, toNum(r[2])),
    count: toNum(r[3]),
    people: toNum(r[4]),
  }));
};

/** How many interactions landed below the first screen. */
export const getHeatFold = async (
  p: HeatmapParams,
  w: AnalyticsWindow,
): Promise<HeatFold | null> => {
  if (posthogSimulated()) return simHeatFold(simHeatPoints(p, w), p.device);
  const rows = await runHogQL(
    `SELECT countIf(NOT pointer_target_fixed),
       countIf(y > viewport_height AND NOT pointer_target_fixed),
       round(quantile(0.5)(viewport_height * scale_factor))
     FROM heatmaps
     WHERE ${WHERE} AND ${HAS_POINTER}`,
    values(p, w),
  );
  if (!rows) return null;
  const r = rows[0] ?? [];
  const median = toNum(r[2]);
  return {
    total: toNum(r[0]),
    belowFold: toNum(r[1]),
    medianViewport: median > 0 ? median : null,
  };
};

/** Visits by the bottom of the deepest screen they showed, 100 px steps. */
export const getScrollDepth = async (
  p: HeatmapParams,
  w: AnalyticsWindow,
): Promise<ScrollBucket[] | null> => {
  if (posthogSimulated()) return simScrollDepth(p, w);
  const rows = await runHogQL(
    `SELECT intDiv((y + viewport_height) * scale_factor, 100) * 100 AS bucket,
       ${count(p)} AS cnt
     FROM heatmaps
     WHERE ${WHERE}
     GROUP BY bucket
     ORDER BY bucket
     LIMIT 5000`,
    values({ ...p, map: { ...p.map, id: "scrolldepth" } }, w),
  );
  if (!rows) return null;
  return rows
    .map((r) => ({ bucket: toNum(r[0]), count: toNum(r[1]) }))
    .filter((b) => b.count > 0)
    .sort((a, b) => a.bucket - b.bucket);
};

/** The page the preview loads. For "a guide (any)" it's the most read guide
 * in the window, in English (the heat holds both languages), else the first
 * guide there is. */
export const previewPath = async (
  p: HeatmapParams,
  w: AnalyticsWindow,
): Promise<string> => {
  if (!p.page.template) return p.page.path;
  const rows = await runHogQL(
    `SELECT properties.$pathname AS path, count() AS views
     FROM events
     WHERE event = '$pageview' AND ${IN_WINDOW}
       AND match(path, '^/docs/[^/?#]+/?$')
     GROUP BY path ORDER BY views DESC LIMIT 1`,
    windowValues(w),
  );
  const top = toStr(rows?.[0]?.[0]).replace(/\/$/, "");
  if (top) return top;
  const first = getDocSlugs("en")[0];
  return first ? `${ROUTES.docs.en}/${first}` : ROUTES.docs.en;
};
