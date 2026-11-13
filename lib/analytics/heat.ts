/**
 * The math and colour the heatmap preview draws with: point intensity, scroll
 * reach bands and the cool-to-hot ramp. No imports, so the client preview can
 * use it without pulling the page catalog (`heatmaps.ts`) into its bundle.
 */

// ── Points ─────────────────────────────────────────────────────────────────

export type HeatPoint = {
  /** Share of the viewport width, 0..1. */
  x: number;
  /** CSS px: from the top of the document, or of the viewport when fixed. */
  y: number;
  fixed: boolean;
  count: number;
};

export type HeatFold = {
  total: number;
  belowFold: number;
  /** Median viewport height, CSS px. */
  medianViewport: number | null;
};

/** The 95th-percentile count: one hot spot (the menu button) must not wash
 * everything else out to nothing. */
export const intensityCap = (points: readonly { count: number }[]): number => {
  if (points.length === 0) return 1;
  const sorted = points.map((p) => p.count).sort((a, b) => a - b);
  return Math.max(1, sorted[Math.floor((sorted.length - 1) * 0.95)]);
};

/** 0.08..1, so a single click still shows. */
export const pointIntensity = (count: number, cap: number) =>
  Math.min(1, Math.max(0.08, count / cap));

export type PointStats = {
  total: number;
  hottest: number;
  /** Share of all interactions on fixed elements (header, menus). */
  fixedShare: number;
  spots: number;
};

export const pointStats = (points: readonly HeatPoint[]): PointStats => {
  const total = points.reduce((n, p) => n + p.count, 0);
  const fixed = points.reduce((n, p) => n + (p.fixed ? p.count : 0), 0);
  return {
    total,
    hottest: points.reduce((m, p) => Math.max(m, p.count), 0),
    fixedShare: total > 0 ? fixed / total : 0,
    spots: points.length,
  };
};

// ── Scroll depth ───────────────────────────────────────────────────────────

export type ScrollBucket = {
  /** The bottom of the deepest screen a visit showed, CSS px, 100 px steps. */
  bucket: number;
  count: number;
};

export type ReachBand = { top: number; bottom: number; reach: number };

const SCROLL_STEP = 100;

/** Contiguous 100 px bands from the top to the deepest bucket; `reach` is the
 * share of visits whose deepest screen got at least that far. */
export const scrollReachBands = (
  buckets: readonly ScrollBucket[],
): ReachBand[] => {
  const total = buckets.reduce((n, b) => n + b.count, 0);
  if (total === 0) return [];
  const deepest = Math.max(...buckets.map((b) => b.bucket));
  const bands: ReachBand[] = [];
  for (let top = 0; top <= deepest; top += SCROLL_STEP) {
    const reached = buckets
      .filter((b) => b.bucket >= top)
      .reduce((n, b) => n + b.count, 0);
    bands.push({ top, bottom: top + SCROLL_STEP, reach: reached / total });
  }
  return bands;
};

/** The share of visits that scrolled below `y`. Strictly below: a visit
 * that never scrolls still reports its first screen's bottom as its bucket,
 * and must not count as having passed it. */
export const scrolledPast = (
  buckets: readonly ScrollBucket[],
  y: number,
): number => {
  const total = buckets.reduce((n, b) => n + b.count, 0);
  if (total === 0) return 0;
  return (
    buckets.filter((b) => b.bucket > y).reduce((n, b) => n + b.count, 0) / total
  );
};

/** How deep `share` of visits got: the bottom of the last band they all
 * reached. */
export const depthReachedBy = (
  bands: readonly ReachBand[],
  share: number,
): number => {
  let depth = 0;
  for (const b of bands) if (b.reach >= share) depth = b.bottom;
  return depth;
};

export const REACH_MARKERS = [0.75, 0.5, 0.25] as const;

// ── Colour ─────────────────────────────────────────────────────────────────

/** Cool to hot. Every stop is a raw colour on purpose: the heat ramp is data,
 * not theme, and it has to read over any page the preview loads. */
const RAMP: readonly [number, number, number, number][] = [
  [0, 37, 99, 235],
  [0.35, 6, 182, 212],
  [0.6, 132, 204, 22],
  [0.8, 250, 204, 21],
  [1, 220, 38, 38],
];

export const heatColor = (t: number): [number, number, number] => {
  const v = Math.min(1, Math.max(0, t));
  for (let i = 1; i < RAMP.length; i++) {
    const [s1, r1, g1, b1] = RAMP[i];
    const [s0, r0, g0, b0] = RAMP[i - 1];
    if (v <= s1) {
      const k = (v - s0) / (s1 - s0);
      return [
        Math.round(r0 + (r1 - r0) * k),
        Math.round(g0 + (g1 - g0) * k),
        Math.round(b0 + (b1 - b0) * k),
      ];
    }
  }
  return [
    RAMP[RAMP.length - 1][1],
    RAMP[RAMP.length - 1][2],
    RAMP[RAMP.length - 1][3],
  ];
};

/** Accumulated alpha below this is a blob's fading rim, not heat. A single
 * faint click still lands well above it. */
const NOISE_FLOOR = 4;

/** 256 RGBA entries for the colourize pass: transparent at no heat, mostly
 * opaque at the top so the page still shows through the coolest spots. */
export const heatPalette = (): Uint8ClampedArray => {
  const out = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const [r, g, b] = heatColor(i / 255);
    out.set(
      [r, g, b, i < NOISE_FLOOR ? 0 : Math.round(60 + (i / 255) * 150)],
      i * 4,
    );
  }
  return out;
};

/** The legend bar. */
export const heatGradientCss = () =>
  `linear-gradient(to right, ${RAMP.map(([s, r, g, b]) => `rgb(${r} ${g} ${b}) ${s * 100}%`).join(", ")})`;
