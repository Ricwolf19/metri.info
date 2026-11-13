import "server-only";

import { CALC_CONTENT } from "@/lib/calculators/content";
import type { CalcId } from "@/lib/calculators/types";
import { ROUTES, type RouteId } from "@/lib/i18n/routes";

import {
  posthogConfigured,
  runHogQL,
  toNum,
  toStr,
  type HogValues,
} from "./posthog";
import {
  ANALYTICS_TIME_ZONE,
  type AnalyticsWindow,
  fillDays,
  shiftDay,
} from "./range";
import {
  simActivityGrid,
  simBehaviorSummary,
  simBreakdown,
  simDailyActivity,
  simDailyVisits,
  simFunnel,
  simulating,
} from "./simulate";

/**
 * What people do on the site, from PostHog: the product events the web fires
 * (`track()` calls and the server's `signup_completed`), funnels between them
 * and where visits come from. Days and hours are on `ANALYTICS_TIME_ZONE`.
 *
 * Every query takes the window as bound values; event names and paths are
 * constants from the code, inlined with `lit`. A null result means PostHog
 * didn't answer (the card says so); an empty list means it did, with nothing.
 */

/** No PostHog keys on a dev server: every reader answers with made-up data. */
export const posthogSimulated = () => simulating(posthogConfigured());

const LOCAL = `toTimeZone(timestamp, '${ANALYTICS_TIME_ZONE}')`;

/** Raw UTC bounds a day wider on each side (cheap to filter on), then the
 * local calendar day, which is what the window means. */
export const IN_WINDOW = `timestamp >= toDateTime({pre_start})
  AND timestamp < toDateTime({pre_end})
  AND toDate(${LOCAL}) >= toDate({start_day})
  AND toDate(${LOCAL}) <= toDate({end_day})`;

export const windowValues = (window: AnalyticsWindow): HogValues => ({
  // The `Z` matters: a bare date parses in the PostHog project's zone.
  pre_start: `${shiftDay(window.startDate, -1)}T00:00:00Z`,
  pre_end: `${shiftDay(window.endDate, 2)}T00:00:00Z`,
  start_day: window.startDate,
  end_day: window.endDate,
});

/** A code constant as a HogQL string literal. Never pass request data here;
 * that goes in `values`. */
const lit = (s: string) => `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

const paths = (...ids: RouteId[]) =>
  ids
    .flatMap((id) => [ROUTES[id].en, ROUTES[id].es])
    .map(lit)
    .join(", ");

const PAGEVIEW = `event = '$pageview'`;
const onPage = (...ids: RouteId[]) =>
  `${PAGEVIEW} AND properties.$pathname IN (${paths(...ids)})`;
const GUIDE_PATH = `'^/(es/)?docs/[^/]+/?$'`;

export type Agg = "total" | "unique";
const countFor = (agg: Agg) =>
  agg === "unique" ? "count(DISTINCT person_id)" : "count()";

// ── Summary ────────────────────────────────────────────────────────────────

export type BehaviorSummary = {
  visitors: number;
  pageviews: number;
  calculatorUses: number;
  calculationsSaved: number;
  guideViews: number;
  quizStarted: number;
  quizCompleted: number;
  apkDownloads: number;
  signups: number;
};

export const getBehaviorSummary = async (
  window: AnalyticsWindow,
): Promise<BehaviorSummary | null> => {
  if (posthogSimulated()) return simBehaviorSummary(window);
  const rows = await runHogQL(
    `SELECT
       uniqIf(person_id, ${PAGEVIEW}),
       countIf(${PAGEVIEW}),
       countIf(event = 'calculator_used'),
       countIf(event = 'calculation_saved'),
       countIf(${PAGEVIEW} AND match(properties.$pathname, ${GUIDE_PATH})),
       countIf(event = 'quiz_started'),
       countIf(event = 'quiz_completed'),
       countIf(event = 'apk_download_clicked'),
       countIf(event = 'signup_completed')
     FROM events
     WHERE ${IN_WINDOW}
       AND event IN ('$pageview', 'calculator_used', 'calculation_saved',
         'quiz_started', 'quiz_completed', 'apk_download_clicked',
         'signup_completed')`,
    windowValues(window),
  );
  if (!rows) return null;
  const r = (rows[0] ?? []).map(toNum);
  return {
    visitors: r[0] ?? 0,
    pageviews: r[1] ?? 0,
    calculatorUses: r[2] ?? 0,
    calculationsSaved: r[3] ?? 0,
    guideViews: r[4] ?? 0,
    quizStarted: r[5] ?? 0,
    quizCompleted: r[6] ?? 0,
    apkDownloads: r[7] ?? 0,
    signups: r[8] ?? 0,
  };
};

// ── Daily ──────────────────────────────────────────────────────────────────

export type DailyVisits = {
  visitors: { date: string; value: number }[];
  pageviews: { date: string; value: number }[];
};

export const getDailyVisits = async (
  window: AnalyticsWindow,
): Promise<DailyVisits | null> => {
  if (posthogSimulated()) return simDailyVisits(window);
  const rows = await runHogQL(
    `SELECT toString(toDate(${LOCAL})) AS day, uniq(person_id), count()
     FROM events
     WHERE ${PAGEVIEW} AND ${IN_WINDOW}
     GROUP BY day
     ORDER BY day
     LIMIT 1000`,
    windowValues(window),
  );
  if (!rows) return null;
  const visitors = new Map<string, number>();
  const pageviews = new Map<string, number>();
  for (const r of rows) {
    const day = toStr(r[0]).slice(0, 10);
    visitors.set(day, toNum(r[1]));
    pageviews.set(day, toNum(r[2]));
  }
  return {
    visitors: fillDays(window, visitors),
    pageviews: fillDays(window, pageviews),
  };
};

// ── Funnels ────────────────────────────────────────────────────────────────

/** A person has a week to go from the first step to the last. */
const FUNNEL_WINDOW_SECONDS = 7 * 86_400;

type FunnelDef = {
  title: string;
  subtitle: string;
  steps: { label: string; when: string }[];
};

export const FUNNELS = {
  signup: {
    title: "Sign-up funnel",
    subtitle: "Visit → calculator → sign-up page → account",
    steps: [
      { label: "Visited", when: PAGEVIEW },
      { label: "Used a calculator", when: `event = 'calculator_used'` },
      { label: "Reached sign-up", when: onPage("signUp") },
      { label: "Created an account", when: `event = 'signup_completed'` },
    ],
  },
  app: {
    title: "App download funnel",
    subtitle: "Visit → download page → APK button",
    steps: [
      { label: "Visited", when: PAGEVIEW },
      { label: "Opened the download page", when: onPage("download") },
      { label: "Tapped download", when: `event = 'apk_download_clicked'` },
    ],
  },
  quiz: {
    title: "Knowledge check funnel",
    subtitle: "Quiz page → started → finished",
    steps: [
      { label: "Opened the quiz", when: onPage("quiz") },
      { label: "Started", when: `event = 'quiz_started'` },
      { label: "Finished", when: `event = 'quiz_completed'` },
    ],
  },
} satisfies Record<string, FunnelDef>;

export type FunnelId = keyof typeof FUNNELS;
export type FunnelStep = { label: string; count: number };

/** The furthest in-order step each person reached; counts never rise from
 * one step to the next. */
export const getFunnel = async (
  id: FunnelId,
  window: AnalyticsWindow,
): Promise<FunnelStep[] | null> => {
  const { steps } = FUNNELS[id];
  if (posthogSimulated()) {
    const counts = simFunnel(id, steps.length, window);
    return steps.map((s, i) => ({ label: s.label, count: counts[i] ?? 0 }));
  }
  const rows = await runHogQL(
    `SELECT ${steps.map((_, i) => `countIf(level >= ${i + 1})`).join(", ")}
     FROM (
       SELECT person_id,
         windowFunnel(${FUNNEL_WINDOW_SECONDS})(
           timestamp,
           ${steps.map((s) => s.when).join(",\n           ")}
         ) AS level
       FROM events
       WHERE ${IN_WINDOW}
       GROUP BY person_id
     )`,
    windowValues(window),
  );
  if (!rows) return null;
  const counts = (rows[0] ?? []).map(toNum);
  return steps.map((s, i) => ({ label: s.label, count: counts[i] ?? 0 }));
};

// ── Ranked lists ───────────────────────────────────────────────────────────

export type RankedRow = {
  label: string;
  value: number;
  /** Distinct people behind `value`, when the query counts both. */
  people?: number;
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** `MX` → "Mexico"; anything Intl doesn't know stays as it came. */
const countryName = (code: string): string => {
  if (!code) return "(not set)";
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
};

const calcName = (id: string) =>
  CALC_CONTENT[id as CalcId]?.en.h1 ?? (id || "(not set)");

/** `$referring_domain` writes direct visits as `$direct`. */
const sourceName = (domain: string) =>
  !domain || domain === "$direct" ? "Direct" : domain;

const BREAKDOWNS = {
  pages: {
    query: `SELECT properties.$pathname AS path, count() AS views, uniq(person_id)
      FROM events
      WHERE ${PAGEVIEW} AND ${IN_WINDOW} AND path != ''
      GROUP BY path ORDER BY views DESC LIMIT 12`,
  },
  entryPages: {
    query: `SELECT entry, count() AS sessions
      FROM (
        SELECT properties.$session_id AS session,
          argMin(properties.$pathname, timestamp) AS entry
        FROM events
        WHERE ${PAGEVIEW} AND ${IN_WINDOW} AND session IS NOT NULL
        GROUP BY session
      )
      GROUP BY entry ORDER BY sessions DESC LIMIT 10`,
  },
  sources: {
    query: `SELECT source, count() AS sessions
      FROM (
        SELECT properties.$session_id AS session,
          argMin(properties.$referring_domain, timestamp) AS source
        FROM events
        WHERE ${PAGEVIEW} AND ${IN_WINDOW} AND session IS NOT NULL
        GROUP BY session
      )
      GROUP BY source ORDER BY sessions DESC LIMIT 10`,
    label: sourceName,
  },
  guides: {
    query: `SELECT properties.$pathname AS path, count() AS views, uniq(person_id)
      FROM events
      WHERE ${PAGEVIEW} AND ${IN_WINDOW} AND match(path, ${GUIDE_PATH})
      GROUP BY path ORDER BY views DESC LIMIT 10`,
  },
  calculators: {
    query: `SELECT properties.calculator AS calculator, count() AS uses, uniq(person_id)
      FROM events
      WHERE event = 'calculator_used' AND ${IN_WINDOW} AND calculator != ''
      GROUP BY calculator ORDER BY uses DESC LIMIT 17`,
    label: calcName,
  },
  countries: {
    query: `SELECT properties.$geoip_country_code AS country, uniq(person_id) AS visitors
      FROM events
      WHERE ${PAGEVIEW} AND ${IN_WINDOW}
      GROUP BY country ORDER BY visitors DESC LIMIT 10`,
    label: countryName,
  },
  devices: {
    query: `SELECT properties.$device_type AS device, uniq(person_id) AS visitors
      FROM events
      WHERE ${PAGEVIEW} AND ${IN_WINDOW}
      GROUP BY device ORDER BY visitors DESC LIMIT 5`,
  },
  browsers: {
    query: `SELECT properties.$browser AS browser, uniq(person_id) AS visitors
      FROM events
      WHERE ${PAGEVIEW} AND ${IN_WINDOW}
      GROUP BY browser ORDER BY visitors DESC LIMIT 8`,
  },
  languages: {
    query: `SELECT if(match(properties.$pathname, '^/es(/|$)'), 'Spanish', 'English') AS language,
        uniq(person_id) AS visitors, count()
      FROM events
      WHERE ${PAGEVIEW} AND ${IN_WINDOW}
      GROUP BY language ORDER BY visitors DESC`,
  },
  events: {
    query: `SELECT event, count() AS total
      FROM events
      WHERE ${IN_WINDOW} AND event NOT LIKE '$%'
      GROUP BY event ORDER BY total DESC LIMIT 15`,
  },
} satisfies Record<string, { query: string; label?: (raw: string) => string }>;

export type BreakdownId = keyof typeof BREAKDOWNS;

/** Rows are `[label, value, people?]`, from PostHog or the simulator. */
export const getBreakdown = async (
  id: BreakdownId,
  window: AnalyticsWindow,
): Promise<RankedRow[] | null> => {
  const def: { query: string; label?: (raw: string) => string } =
    BREAKDOWNS[id];
  const label = def.label ?? ((raw: string) => raw || "(not set)");
  const rows = posthogSimulated()
    ? simBreakdown(id, window)
    : await runHogQL(def.query, windowValues(window));
  if (!rows) return null;
  return rows.map((r) => ({
    label: label(toStr(r[0])),
    value: toNum(r[1]),
    ...(r.length > 2 ? { people: toNum(r[2]) } : {}),
  }));
};

// ── When people come ───────────────────────────────────────────────────────

/** Pageviews (or people) by weekday and hour on the operator's clock:
 * `cells[weekday][hour]`, weekday 0 = Monday. */
export const getActivityGrid = async (
  window: AnalyticsWindow,
  agg: Agg = "total",
): Promise<number[][] | null> => {
  if (posthogSimulated()) return simActivityGrid(window, agg);
  const rows = await runHogQL(
    `SELECT toDayOfWeek(${LOCAL}) AS weekday, toHour(${LOCAL}) AS hour,
       ${countFor(agg)} AS value
     FROM events
     WHERE ${PAGEVIEW} AND ${IN_WINDOW}
     GROUP BY weekday, hour
     LIMIT 200`,
    windowValues(window),
  );
  if (!rows) return null;
  const cells = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const r of rows) {
    const weekday = toNum(r[0]);
    const hour = toNum(r[1]);
    if (weekday >= 1 && weekday <= 7 && hour >= 0 && hour < 24)
      cells[weekday - 1][hour] = toNum(r[2]);
  }
  return cells;
};

export type DayCount = { date: string; count: number };

/** Pageviews (or people) per local day, every day of the window. */
export const getDailyActivity = async (
  window: AnalyticsWindow,
  agg: Agg = "total",
): Promise<DayCount[] | null> => {
  if (posthogSimulated()) return simDailyActivity(window, agg);
  const rows = await runHogQL(
    `SELECT toString(toDate(${LOCAL})) AS day, ${countFor(agg)} AS value
     FROM events
     WHERE ${PAGEVIEW} AND ${IN_WINDOW}
     GROUP BY day
     ORDER BY day
     LIMIT 1000`,
    windowValues(window),
  );
  if (!rows) return null;
  const map = new Map(rows.map((r) => [toStr(r[0]).slice(0, 10), toNum(r[1])]));
  return fillDays(window, map).map((d) => ({ date: d.date, count: d.value }));
};
