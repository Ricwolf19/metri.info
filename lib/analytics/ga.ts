import "server-only";

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { cacheLife, cacheTag } from "next/cache";

import { tags } from "@/lib/cache/tags";

import { googleServiceAccount } from "./google-account";
import { type AnalyticsWindow, fillDays } from "./range";
import {
  simGaBreakdown,
  simGaDaily,
  simGaRealtime,
  simGaSummary,
  simulating,
} from "./simulate";

/**
 * Google Analytics 4 reporting via the Data API (the read side of GA4 — distinct
 * from the `NEXT_PUBLIC_GA_ID` measurement tag that *sends* data). Every helper
 * returns null when unconfigured or on any failure, so the admin dashboard
 * degrades to a "connect" hint instead of crashing — mirrors lib/analytics/posthog.
 *
 * Setup: enable the Analytics Data API, create a service account with Viewer on
 * the GA4 property, then set:
 *   GA4_PROPERTY_ID        numeric property id (Admin → Property Settings)
 *   GA4_CREDENTIALS_JSON   the service-account JSON key, inline (one env var)
 */
const propertyId = process.env.GA4_PROPERTY_ID;

export const gaConfigured = () =>
  Boolean(propertyId && process.env.GA4_CREDENTIALS_JSON);

let client: BetaAnalyticsDataClient | null = null;

/** Lazily build the Data API client from the inline JSON key. Returns null when
 * unconfigured or when the key can't be read (never throws). */
const getClient = (): BetaAnalyticsDataClient | null => {
  if (client) return client;
  const credentials = googleServiceAccount();
  if (!propertyId || !credentials) return null;
  try {
    client = new BetaAnalyticsDataClient({
      credentials,
      projectId: credentials.project_id,
    });
    return client;
  } catch {
    return null;
  }
};

/** No GA4 keys on a dev server: every reader answers with made-up data. */
const simulated = () => simulating(gaConfigured());

const property = () => `properties/${propertyId}`;
const num = (v: string | null | undefined) => Number(v ?? 0) || 0;

type Window = Pick<AnalyticsWindow, "startDate" | "endDate" | "days">;
const dateRanges = (w: Window) => [
  { startDate: w.startDate, endDate: w.endDate },
];

export type GaSummary = {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageviews: number;
  /** 0..1: sessions that lasted 10 s+, saw 2+ pages or fired a key event. */
  engagementRate: number;
  /** Seconds of engagement per active user. */
  engagementPerUser: number;
};

/** Headline numbers for the window, in one report. */
export const getGaSummary = async (w: Window): Promise<GaSummary | null> => {
  "use cache";
  cacheTag(tags.metrics.ga);
  cacheLife("minutes");
  if (simulated()) return simGaSummary(w);
  const c = getClient();
  if (!c) return null;
  try {
    const [res] = await c.runReport({
      property: property(),
      dateRanges: dateRanges(w),
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
        { name: "userEngagementDuration" },
      ],
    });
    const m = (i: number) => num(res.rows?.[0]?.metricValues?.[i]?.value);
    const activeUsers = m(0);
    return {
      activeUsers,
      newUsers: m(1),
      sessions: m(2),
      pageviews: m(3),
      engagementRate: m(4),
      engagementPerUser: activeUsers > 0 ? m(5) / activeUsers : 0,
    };
  } catch {
    return null;
  }
};

export type GaDaily = {
  users: { date: string; value: number }[];
  sessions: { date: string; value: number }[];
  pageviews: { date: string; value: number }[];
};

/** GA4's `date` dimension is `YYYYMMDD`. */
const isoDay = (v: string) =>
  `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;

/** Users, sessions and pageviews per day, every day of the window. */
export const getGaDaily = async (w: Window): Promise<GaDaily | null> => {
  "use cache";
  cacheTag(tags.metrics.ga);
  cacheLife("minutes");
  if (simulated()) return simGaDaily(w);
  const c = getClient();
  if (!c) return null;
  try {
    const [res] = await c.runReport({
      property: property(),
      dateRanges: dateRanges(w),
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: w.days + 1,
    });
    const series = [new Map(), new Map(), new Map()] as Map<string, number>[];
    for (const row of res.rows ?? []) {
      const day = isoDay(row.dimensionValues?.[0]?.value ?? "");
      series.forEach((s, i) => s.set(day, num(row.metricValues?.[i]?.value)));
    }
    return {
      users: fillDays(w, series[0]),
      sessions: fillDays(w, series[1]),
      pageviews: fillDays(w, series[2]),
    };
  } catch {
    return null;
  }
};

export type GaRow = { label: string; value: number };

const BREAKDOWNS = {
  channels: {
    dimension: "sessionDefaultChannelGroup",
    metric: "sessions",
    limit: 8,
  },
  sourceMedium: {
    dimension: "sessionSourceMedium",
    metric: "sessions",
    limit: 10,
  },
  landingPages: { dimension: "landingPage", metric: "sessions", limit: 10 },
  pages: { dimension: "pagePath", metric: "screenPageViews", limit: 10 },
  countries: { dimension: "country", metric: "activeUsers", limit: 10 },
  devices: { dimension: "deviceCategory", metric: "activeUsers", limit: 5 },
  browsers: { dimension: "browser", metric: "activeUsers", limit: 8 },
  newVsReturning: {
    dimension: "newVsReturning",
    metric: "activeUsers",
    limit: 3,
  },
} as const;

export type GaBreakdownId = keyof typeof BREAKDOWNS;

/** One dimension, top rows by its metric. Cached: the Data API speaks gRPC,
 * so it can't ride `fetch`'s `next.tags` like the PostHog/Sentry clients —
 * `use cache` is the only way to tag it. */
export const getGaBreakdown = async (
  id: GaBreakdownId,
  w: Window,
): Promise<GaRow[] | null> => {
  "use cache";
  cacheTag(tags.metrics.ga);
  cacheLife("minutes");
  if (simulated()) return simGaBreakdown(id, w);
  const c = getClient();
  if (!c) return null;
  const def = BREAKDOWNS[id];
  try {
    const [res] = await c.runReport({
      property: property(),
      dateRanges: dateRanges(w),
      dimensions: [{ name: def.dimension }],
      metrics: [{ name: def.metric }],
      orderBys: [{ metric: { metricName: def.metric }, desc: true }],
      limit: def.limit,
    });
    return (res.rows ?? []).map((r) => ({
      label: r.dimensionValues?.[0]?.value || "(not set)",
      value: num(r.metricValues?.[0]?.value),
    }));
  } catch {
    return null;
  }
};

export type GaRealtime = { activeUsers: number; pages: GaRow[] };

/** People on the site in the last 30 minutes, and the pages they're on.
 * Short cache — the whole point is freshness, but this still collapses a
 * burst of panel loads. */
export const getGaRealtime = async (): Promise<GaRealtime | null> => {
  "use cache";
  cacheTag(tags.metrics.ga);
  cacheLife("seconds");
  if (simulated()) return simGaRealtime();
  const c = getClient();
  if (!c) return null;
  try {
    const [[total], [pages]] = await Promise.all([
      c.runRealtimeReport({
        property: property(),
        metrics: [{ name: "activeUsers" }],
      }),
      c.runRealtimeReport({
        property: property(),
        dimensions: [{ name: "unifiedScreenName" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 8,
      }),
    ]);
    return {
      activeUsers: num(total.rows?.[0]?.metricValues?.[0]?.value),
      pages: (pages.rows ?? []).map((r) => ({
        label: r.dimensionValues?.[0]?.value || "(not set)",
        value: num(r.metricValues?.[0]?.value),
      })),
    };
  } catch {
    return null;
  }
};
