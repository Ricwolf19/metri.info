import { CALC_IDS, ROUTES } from "@/lib/i18n/routes";
import { siteUrl } from "@/lib/utils";

import type { SentryIssue } from "./errors";
import {
  type HeatFold,
  type HeatPoint,
  type HeatZone,
  type ScrollBucket,
  zoneKey,
  zoneOf,
} from "./heat";
import type { HeatmapDevice, HeatmapParams } from "./heatmaps";
import { type AnalyticsWindow, fillDays, shiftDay } from "./range";
import type { Inspection, SearchRow, Sitemap } from "./search";

/**
 * Made-up analytics for a development server that has no keys for a source,
 * so every dashboard can be seen and worked on locally instead of reading
 * "connect". Never anywhere else: an invented number on a deployed screen
 * would be taken for a real one. Cards say "Simulated" when they show it.
 *
 * Pure and seeded. A metric's value on a day depends only on the metric and
 * the day, so a 7-day and a 30-day range agree on the days they share and a
 * total always matches its trend. Shapes are what the live readers return,
 * so the panels can't tell the difference.
 */

/** Simulate this source? Only on `next dev`, only without its keys. */
export const simulating = (configured: boolean) =>
  !configured && process.env.NODE_ENV === "development";

// ── Seeded randomness ──────────────────────────────────────────────────────

/** FNV-1a: a stable 32-bit seed from any text. */
const hash = (text: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

/** mulberry32: floats in [0, 1), the same sequence for the same seed. */
const seeded = (seed: string): (() => number) => {
  let state = hash(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const unit = (seed: string) => seeded(seed)();

/** All a simulator needs of a window. */
type Span = Pick<AnalyticsWindow, "startDate" | "endDate" | "days">;

/** A standard normal draw (Box–Muller). */
const gauss = (rand: () => number) =>
  Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());

const windowSeed = (metric: string, w: Span) =>
  `${metric}:${w.startDate}:${w.endDate}`;

// ── Days ───────────────────────────────────────────────────────────────────

/** Sunday-first, as `getUTCDay`: people train and plan on weekdays. */
const WEEKDAY = [0.85, 1.1, 1.15, 1.1, 1.05, 0.95, 0.8];
const EPOCH = Date.parse("2026-01-01T00:00:00Z");

/** The site grows through the year, so a long range shows a trend. */
const growth = (date: string) => {
  const days = (Date.parse(`${date}T00:00:00Z`) - EPOCH) / 86_400_000;
  return 0.45 + 0.55 * Math.min(1, Math.max(0, days / 320));
};

/** One metric on one day, whatever window asks for it. */
const onDay = (metric: string, date: string, base: number, noise = 0.25) => {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const jitter = 1 + (unit(`${metric}:${date}`) * 2 - 1) * noise;
  return Math.max(
    0,
    Math.round(base * WEEKDAY[weekday] * growth(date) * jitter),
  );
};

const series = (metric: string, w: Span, base: number, noise?: number) =>
  fillDays(w, new Map()).map(({ date }) => ({
    date,
    value: onDay(metric, date, base, noise),
  }));

const total = (metric: string, w: Span, base: number) =>
  series(metric, w, base).reduce((n, d) => n + d.value, 0);

/** `labels` with falling, slightly shuffled weights, scaled to `volume`. */
const ranked = (seed: string, labels: readonly string[], volume: number) => {
  const rand = seeded(seed);
  const weights = labels.map((_, i) => (0.7 + 0.6 * rand()) / (i + 1.3));
  const sum = weights.reduce((a, b) => a + b, 0);
  return labels
    .map((label, i) => ({
      label,
      value: Math.round((weights[i] / sum) * volume),
    }))
    .sort((a, b) => b.value - a.value);
};

// ── PostHog ────────────────────────────────────────────────────────────────

/** Per-day volumes at full growth. */
const PH = {
  pageviews: 380,
  visitors: 150,
  calculatorUses: 95,
  calculationsSaved: 6,
  guideViews: 60,
  quizStarted: 9,
  quizCompleted: 5,
  apkDownloads: 7,
  signups: 1.4,
};

/** Daily visitors overlap across days; the window's distinct count is less
 * than their sum. */
const distinct = (w: Span, sum: number) =>
  Math.round(sum * (w.days > 1 ? 0.72 : 1));

export const simBehaviorSummary = (w: Span) => {
  const started = total("ph.quizStarted", w, PH.quizStarted);
  return {
    visitors: distinct(w, total("ph.visitors", w, PH.visitors)),
    pageviews: total("ph.pageviews", w, PH.pageviews),
    calculatorUses: total("ph.calculatorUses", w, PH.calculatorUses),
    calculationsSaved: total("ph.calculationsSaved", w, PH.calculationsSaved),
    guideViews: total("ph.guideViews", w, PH.guideViews),
    quizStarted: started,
    quizCompleted: Math.min(
      started,
      total("ph.quizCompleted", w, PH.quizCompleted),
    ),
    apkDownloads: total("ph.apkDownloads", w, PH.apkDownloads),
    signups: total("ph.signups", w, PH.signups),
  };
};

export const simDailyVisits = (w: Span) => ({
  visitors: series("ph.visitors", w, PH.visitors),
  pageviews: series("ph.pageviews", w, PH.pageviews),
});

/** Step-to-step conversion per funnel; each step keeps this share of the
 * one before. */
const FUNNEL_RATES: Record<string, number[]> = {
  signup: [0.46, 0.11, 0.32],
  app: [0.21, 0.38],
  quiz: [0.62, 0.58],
};

export const simFunnel = (id: string, steps: number, w: Span) => {
  const first =
    id === "quiz"
      ? total("ph.quizPage", w, 22)
      : distinct(w, total("ph.visitors", w, PH.visitors));
  const rates = FUNNEL_RATES[id] ?? [];
  const counts = [first];
  for (let i = 1; i < steps; i++)
    counts.push(Math.round(counts[i - 1] * (rates[i - 1] ?? 0.5)));
  return counts;
};

const GUIDES = [
  "/docs/tdee",
  "/docs/macros",
  "/es/docs/tdee",
  "/docs/progressive-overload",
  "/docs/body-fat-guide",
  "/es/docs/macros-calculator-guide",
  "/docs/ffmi-guide",
  "/docs/one-rep-max-guide",
  "/docs/volume-frequency",
  "/docs/sleep",
];

const PAGES = [
  ROUTES.home.en,
  ROUTES.tdee.en,
  ROUTES.tools.en,
  ROUTES.home.es,
  ROUTES.bodyfat.en,
  ROUTES.docs.en,
  ROUTES.bmi.es,
  ROUTES.macros.en,
  ROUTES.quiz.en,
  ROUTES.download.en,
  ROUTES.onerm.en,
  ROUTES.tdee.es,
];

const BREAKDOWNS: Record<
  string,
  { labels: readonly string[]; volume: (w: Span) => number; people?: number }
> = {
  pages: {
    labels: PAGES,
    volume: (w) => total("ph.pageviews", w, PH.pageviews),
    people: 0.6,
  },
  entryPages: {
    labels: PAGES.slice(0, 10),
    volume: (w) => total("ph.visitors", w, PH.visitors) * 1.3,
  },
  sources: {
    labels: [
      "$direct",
      "www.google.com",
      "www.google.com.mx",
      "github.com",
      "www.bing.com",
      "duckduckgo.com",
      "www.reddit.com",
      "t.co",
    ],
    volume: (w) => total("ph.visitors", w, PH.visitors) * 1.3,
  },
  guides: {
    labels: GUIDES,
    volume: (w) => total("ph.guideViews", w, PH.guideViews),
    people: 0.7,
  },
  calculators: {
    labels: CALC_IDS,
    volume: (w) => total("ph.calculatorUses", w, PH.calculatorUses),
    people: 0.55,
  },
  languages: {
    labels: ["English", "Spanish"],
    volume: (w) => distinct(w, total("ph.visitors", w, PH.visitors)),
    people: 2.4,
  },
  countries: {
    labels: ["MX", "US", "ES", "CO", "AR", "CL", "PE", "GB", "CA", "DE"],
    volume: (w) => distinct(w, total("ph.visitors", w, PH.visitors)),
  },
  devices: {
    labels: ["Mobile", "Desktop", "Tablet"],
    volume: (w) => distinct(w, total("ph.visitors", w, PH.visitors)),
  },
  browsers: {
    labels: [
      "Chrome",
      "Mobile Safari",
      "Safari",
      "Samsung Internet",
      "Firefox",
      "Microsoft Edge",
    ],
    volume: (w) => distinct(w, total("ph.visitors", w, PH.visitors)),
  },
  events: {
    labels: [
      "calculator_used",
      "doc_opened",
      "share_clicked",
      "favorite_toggled",
      "quiz_started",
      "apk_download_clicked",
      "quiz_completed",
      "calculation_saved",
      "locale_changed",
      "signup_completed",
    ],
    volume: (w) => total("ph.calculatorUses", w, PH.calculatorUses) * 2.2,
  },
};

/** Rows as PostHog returns them, `[label, value, people?]`: the reader
 * names and parses them exactly as it does live ones. */
export const simBreakdown = (id: string, w: Span): unknown[][] => {
  const def = BREAKDOWNS[id];
  if (!def) return [];
  return ranked(windowSeed(`ph.${id}`, w), def.labels, def.volume(w)).map(
    (r) =>
      def.people
        ? [r.label, r.value, Math.round(r.value * def.people)]
        : [r.label, r.value],
  );
};

/** Evenings and lunch busiest, small hours quiet. */
const HOURS = [
  0.15, 0.08, 0.05, 0.04, 0.05, 0.12, 0.35, 0.6, 0.75, 0.8, 0.82, 0.85, 0.9,
  0.85, 0.8, 0.82, 0.88, 0.95, 1, 1, 0.95, 0.8, 0.55, 0.3,
];

export const simActivityGrid = (w: Span, agg: "total" | "unique") => {
  const rand = seeded(windowSeed(`ph.grid.${agg}`, w));
  const volume =
    agg === "unique"
      ? distinct(w, total("ph.visitors", w, PH.visitors))
      : total("ph.pageviews", w, PH.pageviews);
  const weight = (d: number, h: number) => HOURS[h] * WEEKDAY[(d + 1) % 7];
  let sum = 0;
  for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) sum += weight(d, h);
  return Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) =>
      Math.round((volume / sum) * weight(d, h) * (0.75 + 0.5 * rand())),
    ),
  );
};

export const simDailyActivity = (w: Span, agg: "total" | "unique") =>
  (agg === "unique"
    ? series("ph.visitors", w, PH.visitors)
    : series("ph.pageviews", w, PH.pageviews)
  ).map((d) => ({ date: d.date, count: d.value }));

// ── Heatmaps ───────────────────────────────────────────────────────────────

type Zone = {
  x: number;
  y: number;
  sx: number;
  sy: number;
  n: number;
  fixed?: boolean;
};

/** Where people click on a Metri page: the header, the first screen's main
 * action, content thinning out below, the footer. */
const zones = (device: HeatmapDevice, rand: () => number): Zone[] => {
  const phone = device.width < 640;
  const h = device.height;
  return [
    ...(phone
      ? [
          { x: 0.9, y: 28, sx: 0.02, sy: 5, n: 50, fixed: true },
          { x: 0.12, y: 28, sx: 0.04, sy: 5, n: 14, fixed: true },
        ]
      : [
          { x: 0.5, y: 32, sx: 0.12, sy: 5, n: 60, fixed: true },
          { x: 0.9, y: 32, sx: 0.02, sy: 5, n: 22, fixed: true },
        ]),
    {
      x: phone ? 0.5 : 0.44,
      y: h * 0.62,
      sx: phone ? 0.16 : 0.05,
      sy: 18,
      n: 130,
    },
    {
      x: phone ? 0.5 : 0.56,
      y: h * 0.62,
      sx: phone ? 0.16 : 0.05,
      sy: 18,
      n: 70,
    },
    ...Array.from({ length: 6 }, (_, i) => ({
      x: 0.25 + rand() * 0.5,
      y: h * (1.15 + i * 0.8),
      sx: phone ? 0.2 : 0.14,
      sy: 90,
      n: 80 - i * 11,
    })),
    { x: 0.5, y: h * 6.2, sx: 0.25, sy: 40, n: 18 },
  ];
};

const MAP_VOLUME: Record<string, number> = {
  click: 1,
  rageclick: 0.04,
  deadclick: 0.08,
  mousemove: 2.5,
};

export const simHeatPoints = (
  p: Pick<HeatmapParams, "page" | "device" | "map" | "agg">,
  w: Span,
): HeatPoint[] => {
  const rand = seeded(
    windowSeed(`heat:${p.page.id}:${p.device.id}:${p.map.id}`, w),
  );
  // Volume follows the range, but the sample stays drawable.
  const scale =
    Math.min(6, Math.max(0.5, w.days / 14)) * (MAP_VOLUME[p.map.id] ?? 1);
  const spots = new Map<string, HeatPoint>();
  for (const z of zones(p.device, rand)) {
    const n = Math.max(
      z.fixed || scale >= 0.2 ? 1 : 0,
      Math.round(z.n * scale),
    );
    for (let i = 0; i < n; i++) {
      // PostHog's own grid: x to 0.01, y to 16 px.
      const x =
        Math.round(Math.min(1, Math.max(0, z.x + gauss(rand) * z.sx)) * 100) /
        100;
      const y = Math.max(0, Math.round((z.y + gauss(rand) * z.sy) / 16) * 16);
      const key = `${z.fixed ? 1 : 0}:${x}:${y}`;
      const spot = spots.get(key) ?? {
        x,
        y,
        fixed: Boolean(z.fixed),
        count: 0,
      };
      spot.count++;
      spots.set(key, spot);
    }
  }
  return [...spots.values()].map((s) =>
    p.agg === "unique"
      ? { ...s, count: Math.max(1, Math.round(s.count / 1.5)) }
      : s,
  );
};

/** The same simulated interactions per hover zone; a visitor accounts for
 * about one and a half of them, as in the unique-visitors view. */
export const simHeatZones = (
  p: Pick<HeatmapParams, "page" | "device" | "map">,
  w: Span,
): HeatZone[] => {
  const zones = new Map<string, HeatZone>();
  for (const pt of simHeatPoints({ ...p, agg: "total" }, w)) {
    const { col, row } = zoneOf(pt.x, pt.y);
    const key = zoneKey(pt.fixed, col, row);
    const zone = zones.get(key) ?? {
      fixed: pt.fixed,
      col,
      row,
      count: 0,
      people: 0,
    };
    zone.count += pt.count;
    zones.set(key, zone);
  }
  return [...zones.values()].map((z) => ({
    ...z,
    people: Math.max(1, Math.round(z.count / 1.5)),
  }));
};

export const simHeatFold = (
  points: readonly HeatPoint[],
  device: HeatmapDevice,
): HeatFold => {
  const page = points.filter((p) => !p.fixed);
  return {
    total: page.reduce((n, p) => n + p.count, 0),
    belowFold: page
      .filter((p) => p.y > device.height)
      .reduce((n, p) => n + p.count, 0),
    medianViewport: device.height,
  };
};

/** A third of visits never scroll; the rest fall off with depth. */
export const simScrollDepth = (
  p: Pick<HeatmapParams, "page" | "device" | "agg">,
  w: Span,
): ScrollBucket[] => {
  const rand = seeded(windowSeed(`scroll:${p.page.id}:${p.device.id}`, w));
  const visits = Math.round(total("ph.pageviews", w, PH.pageviews) * 0.18) || 1;
  const samples = Math.min(visits, 3000);
  const first = Math.ceil(p.device.height / 100) * 100;
  const deepest = first * 7;
  const buckets = new Map<number, number>();
  for (let i = 0; i < samples; i++) {
    const depth =
      rand() < 0.33
        ? first
        : Math.min(
            deepest,
            Math.ceil((first - Math.log(1 - rand()) * first * 1.6) / 100) * 100,
          );
    buckets.set(depth, (buckets.get(depth) ?? 0) + 1);
  }
  const k = (visits / samples) * (p.agg === "unique" ? 0.7 : 1);
  return [...buckets.entries()]
    .map(([bucket, count]) => ({
      bucket,
      count: Math.max(1, Math.round(count * k)),
    }))
    .sort((a, b) => a.bucket - b.bucket);
};

// ── GA4 ────────────────────────────────────────────────────────────────────

const GA = { users: 165, sessions: 215, pageviews: 520 };

export const simGaSummary = (w: Span) => {
  const activeUsers = distinct(w, total("ga.users", w, GA.users));
  return {
    activeUsers,
    newUsers: Math.round(activeUsers * 0.68),
    sessions: total("ga.sessions", w, GA.sessions),
    pageviews: total("ga.pageviews", w, GA.pageviews),
    engagementRate: 0.5 + unit(windowSeed("ga.engagement", w)) * 0.12,
    engagementPerUser: 70 + unit(windowSeed("ga.time", w)) * 60,
  };
};

export const simGaDaily = (w: Span) => ({
  users: series("ga.users", w, GA.users),
  sessions: series("ga.sessions", w, GA.sessions),
  pageviews: series("ga.pageviews", w, GA.pageviews),
});

const GA_LABELS: Record<string, readonly string[]> = {
  channels: [
    "Organic Search",
    "Direct",
    "Referral",
    "Organic Social",
    "Unassigned",
  ],
  sourceMedium: [
    "google / organic",
    "(direct) / (none)",
    "github.com / referral",
    "bing / organic",
    "reddit.com / referral",
    "t.co / referral",
  ],
  landingPages: PAGES.slice(0, 10),
  pages: PAGES.slice(0, 10),
  countries: [
    "Mexico",
    "United States",
    "Spain",
    "Colombia",
    "Argentina",
    "Chile",
    "Peru",
  ],
  devices: ["mobile", "desktop", "tablet"],
  browsers: ["Chrome", "Safari", "Samsung Internet", "Firefox", "Edge"],
  newVsReturning: ["new", "returning"],
};

const GA_METRIC: Record<string, "users" | "sessions" | "pageviews"> = {
  channels: "sessions",
  sourceMedium: "sessions",
  landingPages: "sessions",
  pages: "pageviews",
};

export const simGaBreakdown = (id: string, w: Span) => {
  const metric = GA_METRIC[id] ?? "users";
  return ranked(
    windowSeed(`ga.${id}`, w),
    GA_LABELS[id] ?? [],
    total(`ga.${metric}`, w, GA[metric]),
  );
};

export const simGaRealtime = () => ({
  activeUsers: 7,
  pages: [
    { label: "TDEE Calculator · Metri", value: 3 },
    { label: "Metri · Track. Progress. Evolve.", value: 2 },
    { label: "Calculadora de grasa corporal · Metri", value: 1 },
    { label: "Progressive overload · Metri", value: 1 },
  ],
});

// ── Search Console ─────────────────────────────────────────────────────────

/** Query and its typical position. A few sit high but are rarely clicked,
 * a few rank 8–20: both opportunity lists have something to show. */
const QUERIES: [string, number][] = [
  ["tdee calculator", 6.2],
  ["calculadora tdee", 4.1],
  ["ffmi calculator", 8.7],
  ["calculadora imc", 11.4],
  ["1rm calculator", 9.8],
  ["body fat calculator", 14.2],
  ["macro calculator", 12.5],
  ["calculadora de macros", 7.9],
  ["calculadora grasa corporal", 10.3],
  ["wilks calculator", 5.4],
  ["plate calculator", 13.1],
  ["lean body mass calculator", 17.6],
  ["metri app", 1.4],
  ["protein intake calculator", 19.2],
  ["calculadora 1rm", 6.6],
  ["ideal weight calculator", 24.3],
  ["heart rate zones calculator", 16.8],
  ["waist to height ratio", 21.5],
];

const ctrAt = (position: number) =>
  position < 2
    ? 0.25
    : position < 4
      ? 0.1
      : position < 11
        ? 0.035
        : position < 21
          ? 0.01
          : 0.004;

const searchRow = (
  keys: string[],
  impressions: number,
  position: number,
  ctr: number,
): SearchRow => {
  const clicks = Math.round(impressions * ctr);
  return {
    keys,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position,
  };
};

const searchBreakdown = (seed: string, w: Span, keys: readonly string[]) => {
  const impressions = total("gsc.impressions", w, 140);
  return ranked(windowSeed(seed, w), keys, impressions).map((r, i) => {
    const position = 9 + i * 1.7 + unit(`${seed}:${r.label}`) * 4;
    return searchRow(
      [r.label],
      r.value,
      Math.round(position * 10) / 10,
      ctrAt(position),
    );
  });
};

export const simSearchRows = (
  w: Span,
  dimensions: readonly string[],
  rowLimit?: number,
): SearchRow[] => {
  const dim = dimensions[0];
  let rows: SearchRow[];
  if (dim === "date")
    rows = fillDays(w, new Map()).map(({ date }) => {
      // Clicks get their own series: impressions × a page-two CTR rounds
      // to zero most days and draws a flat line with spikes.
      const impressions = onDay("gsc.impressions", date, 140);
      const clicks = Math.min(impressions, onDay("gsc.clicks", date, 5, 0.45));
      return {
        keys: [date],
        clicks,
        impressions,
        ctr: impressions > 0 ? clicks / impressions : 0,
        position: Math.round((13 + unit(`gsc.position:${date}`) * 4) * 10) / 10,
      };
    });
  else if (dim === "query") {
    const impressions = total("gsc.impressions", w, 140) * 0.8;
    rows = ranked(
      windowSeed("gsc.query", w),
      QUERIES.map(([q]) => q),
      impressions,
    ).map((r) => {
      const base = QUERIES.find(([q]) => q === r.label)?.[1] ?? 15;
      const position = Math.max(
        1,
        base + (unit(windowSeed(`gsc.pos:${r.label}`, w)) - 0.5) * 2,
      );
      // Every fourth query on page one is under par: a title worth rewriting.
      const ctr = ctrAt(position) * (hash(r.label) % 4 === 0 ? 0.3 : 1);
      return searchRow([r.label], r.value, Math.round(position * 10) / 10, ctr);
    });
  } else if (dim === "page")
    rows = searchBreakdown(
      "gsc.page",
      w,
      PAGES.map((p) => `${siteUrl}${p === "/" ? "/" : p}`),
    );
  else if (dim === "country")
    rows = searchBreakdown("gsc.country", w, [
      "mex",
      "usa",
      "esp",
      "col",
      "arg",
      "chl",
      "per",
    ]);
  else if (dim === "device")
    rows = searchBreakdown("gsc.device", w, ["MOBILE", "DESKTOP", "TABLET"]);
  else {
    const days = simSearchRows(w, ["date"]);
    const clicks = days.reduce((n, r) => n + r.clicks, 0);
    const impressions = days.reduce((n, r) => n + r.impressions, 0);
    const position =
      days.reduce((n, r) => n + r.position * r.impressions, 0) /
      Math.max(1, impressions);
    rows = [
      {
        keys: [],
        clicks,
        impressions,
        ctr: impressions ? clicks / impressions : 0,
        position,
      },
    ];
  }
  return rowLimit ? rows.slice(0, rowLimit) : rows;
};

export const simSitemaps = (now: Date, urls: number): Sitemap[] => [
  {
    path: `${siteUrl}/sitemap.xml`,
    isIndex: false,
    submitted: urls,
    errors: 0,
    warnings: 0,
    isPending: false,
    lastDownloaded: new Date(now.getTime() - 2 * 86_400_000).toISOString(),
    lastSubmitted: new Date(now.getTime() - 40 * 86_400_000).toISOString(),
  },
];

/** Most of a new site's URLs "discovered, not indexed" — the state Search
 * Console reports for Metri today — with the home pages indexed. */
export const simInspections = (
  urls: readonly string[],
  now: Date,
): Inspection[] => {
  const crawled = (url: string) =>
    new Date(
      now.getTime() -
        (1 + Math.floor(unit(`gsc.crawl:${url}`) * 40)) * 86_400_000,
    ).toISOString();
  return urls.map((url) => {
    const path = new URL(url).pathname;
    const r = path === "/" || path === "/es" ? 0 : unit(`gsc.state:${url}`);
    const base: Inspection = {
      url,
      verdict: "NEUTRAL",
      coverage: "Discovered - currently not indexed",
      lastCrawl: null,
      googleCanonical: null,
      userCanonical: url,
      robots: "ALLOWED",
      fetch: null,
    };
    if (r < 0.22)
      return {
        ...base,
        verdict: "PASS",
        coverage: "Submitted and indexed",
        lastCrawl: crawled(url),
        googleCanonical: url,
        fetch: "SUCCESSFUL",
      };
    if (r < 0.8) return base;
    if (r < 0.95)
      return {
        ...base,
        coverage: "Crawled - currently not indexed",
        lastCrawl: crawled(url),
        fetch: "SUCCESSFUL",
      };
    return {
      ...base,
      coverage: "Duplicate, Google chose different canonical than user",
      lastCrawl: crawled(url),
      googleCanonical: `${siteUrl}${ROUTES.home.en}`,
      fetch: "SUCCESSFUL",
    };
  });
};

// ── Sentry ─────────────────────────────────────────────────────────────────

export const simSentryTotals = () => ({ last24h: 6, last14d: 83 });

export const simSentryDaily = (w: Span) => series("sentry.errors", w, 6, 0.7);

const ISSUES: [string, string, string][] = [
  [
    "TypeError: Cannot read properties of undefined (reading 'map')",
    "components/body/WeightChart",
    "error",
  ],
  ["ChunkLoadError: Loading chunk 4821 failed.", "app/tools/[calc]", "error"],
  [
    "Error: Hydration failed because the server rendered text didn't match the client.",
    "app/quiz",
    "error",
  ],
  [
    "TypeError: NetworkError when attempting to fetch resource.",
    "lib/sync/client",
    "warning",
  ],
  [
    "AbortError: The operation was aborted.",
    "components/analytics/PostHogProvider",
    "warning",
  ],
  [
    "RangeError: Invalid time value",
    "components/account/SyncedActivity",
    "error",
  ],
];

export const simSentryIssues = (w: Span, limit: number): SentryIssue[] => {
  const events = total("sentry.errors", w, 6);
  return ranked(
    windowSeed("sentry.issues", w),
    ISSUES.map(([t]) => t),
    events,
  )
    .slice(0, limit)
    .map((r, i) => {
      const [, culprit, level] = ISSUES.find(([t]) => t === r.label)!;
      return {
        id: `sim-${i}`,
        shortId: `METRI-WEB-${(0x1a + i).toString(16).toUpperCase()}`,
        title: r.label,
        culprit,
        level,
        count: r.value,
        users: Math.max(1, Math.round(r.value * 0.4)),
        firstSeen: `${w.startDate}T09:00:00Z`,
        lastSeen: `${shiftDay(w.endDate, -(i % 3))}T${String(10 + i).padStart(2, "0")}:20:00Z`,
        // A made-up issue never links anywhere.
        permalink: null,
      };
    });
};

const SENTRY_LABELS: Record<string, readonly string[]> = {
  release: ["e46c128", "d65a896", "ff3233c", "239f2b4"],
  page: ["/tools/[calc]", "/docs/[slug]", "/", "/account/body", "/quiz"],
  browser: ["Chrome", "Mobile Safari", "Samsung Internet", "Firefox"],
  os: ["Android", "iOS", "Windows", "Mac OS X"],
};

export const simSentryBreakdown = (id: string, w: Span) =>
  ranked(
    windowSeed(`sentry.${id}`, w),
    SENTRY_LABELS[id] ?? [],
    total("sentry.errors", w, 6),
  );
