import { CALC_CONTENT } from "@/lib/calculators/content";
import { CALC_IDS, ROUTES, type RouteId } from "@/lib/i18n/routes";

import type { SearchParams } from "./range";

/**
 * Pure side of the PostHog heatmaps dashboard: which pages, devices and maps
 * can be asked for, how the URL encodes them, and the math the preview draws
 * with. `heatmap-queries.ts` reads the data, `components/admin/heatmaps`
 * draws it.
 *
 * How PostHog stores a point (posthog-js `enable_heatmaps`): `x`/`y` are the
 * pointer's document coordinates (clientX + scrollX, clientY + scrollY), or
 * its viewport coordinates when the target sits in a fixed or sticky element
 * (`pointer_target_fixed`). Ingestion divides x, y, viewport_width and
 * viewport_height by 16 (`scale_factor`). We read x back as a share of the
 * viewport width (0..1) and y as CSS pixels, so a point lands on the same
 * element at any preview width of its device class.
 */

/** PostHog keeps heatmap data for 90 days. */
export const HEATMAP_RETENTION_DAYS = 90;

/** At most this many distinct spots per map; the busiest are kept. */
export const HEATMAP_POINT_LIMIT = 5000;

// ── Pages ──────────────────────────────────────────────────────────────────

export type HeatmapPage = {
  id: string;
  label: string;
  /** The English page the preview loads. */
  path: string;
  /** Matches the path part of a URL, both languages. */
  pathRegex: string;
  /** One page standing for many (every guide); the preview shows the most
   * visited of them. */
  template?: boolean;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Both language versions of a route; `/` matches with or without the slash. */
const routeRegex = (id: RouteId) => {
  const alts = [ROUTES[id].en, ROUTES[id].es].map((p) =>
    escapeRegex(p === "/" ? "" : p.replace(/\/$/, "")),
  );
  return `(?:${alts.join("|")})/?`;
};

const page = (id: RouteId, label: string): HeatmapPage => ({
  id,
  label,
  path: ROUTES[id].en,
  pathRegex: routeRegex(id),
});

export const HEATMAP_PAGES: readonly HeatmapPage[] = [
  page("home", "Home"),
  page("tools", "Calculators"),
  ...CALC_IDS.map((id) => page(id, CALC_CONTENT[id].en.h1)),
  page("docs", "Guides"),
  {
    id: "guide",
    label: "A guide (any)",
    path: `${ROUTES.docs.en}/*`,
    pathRegex: `(?:${escapeRegex(ROUTES.docs.en)}|${escapeRegex(ROUTES.docs.es)})/[^/?#]+/?`,
    template: true,
  },
  page("quiz", "Knowledge check"),
  page("download", "Download"),
  page("about", "About"),
  page("contact", "Contact"),
  page("signUp", "Sign up"),
];

/**
 * A regex over the full `current_url` PostHog recorded: production host only
 * (apex or www), the page's path in either language, then any query or hash.
 */
export const heatmapUrlPattern = (p: HeatmapPage, host: string) =>
  `^https://(?:www\\.)?${escapeRegex(host)}${p.pathRegex}(?:[?#].*)?$`;

// ── Devices ────────────────────────────────────────────────────────────────

export type HeatmapDevice = {
  id: "mobile" | "tablet" | "desktop" | "wide";
  label: string;
  /** The preview's viewport, CSS px. */
  width: number;
  height: number;
  /** PostHog's stored `viewport_width` (CSS px / 16), inclusive. Adjacent
   * classes share no value, so each visit counts under exactly one. */
  minScaled: number;
  maxScaled: number | null;
};

export const HEATMAP_DEVICES: readonly HeatmapDevice[] = [
  {
    id: "mobile",
    label: "Phone",
    width: 390,
    height: 844,
    minScaled: 0,
    maxScaled: 40,
  },
  {
    id: "tablet",
    label: "Tablet",
    width: 768,
    height: 1024,
    minScaled: 41,
    maxScaled: 63,
  },
  {
    id: "desktop",
    label: "Desktop",
    width: 1280,
    height: 800,
    minScaled: 64,
    maxScaled: 99,
  },
  {
    id: "wide",
    label: "Wide",
    width: 1920,
    height: 1080,
    minScaled: 100,
    maxScaled: null,
  },
];

/** "1024–1599 px" — the real widths a device class covers. */
export const deviceWidthRange = (d: HeatmapDevice) =>
  d.maxScaled === null
    ? `${d.minScaled * 16} px and wider`
    : `${d.minScaled * 16}–${d.maxScaled * 16 + 15} px`;

// ── Maps ───────────────────────────────────────────────────────────────────

export type HeatmapMap = {
  id: "click" | "rageclick" | "deadclick" | "mousemove" | "scrolldepth";
  label: string;
  /** Plural noun for counts: "clicks". */
  noun: string;
};

export const HEATMAP_MAPS: readonly HeatmapMap[] = [
  { id: "click", label: "Clicks", noun: "clicks" },
  { id: "rageclick", label: "Rage clicks", noun: "rage clicks" },
  { id: "deadclick", label: "Dead clicks", noun: "dead clicks" },
  { id: "mousemove", label: "Movement", noun: "moves" },
  { id: "scrolldepth", label: "Scroll depth", noun: "visits" },
];

export type HeatmapAgg = "total" | "unique";

export const HEATMAP_AGGS: readonly { id: HeatmapAgg; label: string }[] = [
  { id: "total", label: "Every interaction" },
  { id: "unique", label: "Unique visitors" },
];

// ── URL params ─────────────────────────────────────────────────────────────

export type HeatmapParams = {
  page: HeatmapPage;
  device: HeatmapDevice;
  map: HeatmapMap;
  agg: HeatmapAgg;
};

/** What the bare URL shows; the controls drop a param that equals it. */
export const HEATMAP_DEFAULTS = {
  page: "home",
  device: "desktop",
  map: "click",
  count: "total",
} as const;

const pick = <T extends { id: string }>(
  list: readonly T[],
  raw: string | string[] | undefined,
  fallback: string,
): T => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return list.find((x) => x.id === v) ?? list.find((x) => x.id === fallback)!;
};

/** `?page=&device=&map=&count=`; anything unknown falls back to its default. */
export const parseHeatmapParams = (params: SearchParams): HeatmapParams => ({
  page: pick(HEATMAP_PAGES, params.page, HEATMAP_DEFAULTS.page),
  device: pick(HEATMAP_DEVICES, params.device, HEATMAP_DEFAULTS.device),
  map: pick(HEATMAP_MAPS, params.map, HEATMAP_DEFAULTS.map),
  agg: pick(HEATMAP_AGGS, params.count, HEATMAP_DEFAULTS.count).id,
});
