import "server-only";

import { BetaAnalyticsDataClient } from "@google-analytics/data";

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
const credentialsJson = process.env.GA4_CREDENTIALS_JSON;

export const gaConfigured = () => Boolean(propertyId && credentialsJson);

let client: BetaAnalyticsDataClient | null = null;

/** Lazily build the Data API client from the inline JSON key. Returns null when
 * unconfigured or when the JSON can't be parsed (never throws). */
const getClient = (): BetaAnalyticsDataClient | null => {
  if (!propertyId || !credentialsJson) return null;
  if (client) return client;
  try {
    const credentials = JSON.parse(credentialsJson) as {
      client_email: string;
      private_key: string;
      project_id?: string;
    };
    client = new BetaAnalyticsDataClient({
      credentials,
      projectId: credentials.project_id,
    });
    return client;
  } catch {
    return null;
  }
};

const property = () => `properties/${propertyId}`;
const num = (v: string | null | undefined) => Number(v ?? 0) || 0;

export type GaSplit = { last7: number; last30: number };
export type GaSummary = {
  activeUsers: GaSplit;
  sessions: GaSplit;
  pageviews: GaSplit;
} | null;

/** Active users, sessions and pageviews for the last 7 and 30 days. Two date
 * ranges in one report → GA adds a `dateRange` dimension (`date_range_0/1`). */
export const getGaSummary = async (): Promise<GaSummary> => {
  const c = getClient();
  if (!c) return null;
  try {
    const [res] = await c.runReport({
      property: property(),
      dateRanges: [
        { startDate: "7daysAgo", endDate: "today" },
        { startDate: "30daysAgo", endDate: "today" },
      ],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
    });
    const pick = (rangeKey: string, metric: number) =>
      num(
        res.rows?.find((r) => r.dimensionValues?.[0]?.value === rangeKey)
          ?.metricValues?.[metric]?.value,
      );
    return {
      activeUsers: {
        last7: pick("date_range_0", 0),
        last30: pick("date_range_1", 0),
      },
      sessions: {
        last7: pick("date_range_0", 1),
        last30: pick("date_range_1", 1),
      },
      pageviews: {
        last7: pick("date_range_0", 2),
        last30: pick("date_range_1", 2),
      },
    };
  } catch {
    return null;
  }
};

export type GaRow = { label: string; value: number };

/** Generic single-dimension top list (pages, countries, devices, sources). */
const topByDimension = async (
  dimension: string,
  metric: string,
  limit: number,
): Promise<GaRow[] | null> => {
  const c = getClient();
  if (!c) return null;
  try {
    const [res] = await c.runReport({
      property: property(),
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: dimension }],
      metrics: [{ name: metric }],
      orderBys: [{ metric: { metricName: metric }, desc: true }],
      limit,
    });
    return (res.rows ?? []).map((r) => ({
      label: r.dimensionValues?.[0]?.value ?? "(not set)",
      value: num(r.metricValues?.[0]?.value),
    }));
  } catch {
    return null;
  }
};

export const getGaTopPages = () =>
  topByDimension("pagePath", "screenPageViews", 10);
export const getGaTopCountries = () =>
  topByDimension("country", "activeUsers", 10);
export const getGaDeviceBreakdown = () =>
  topByDimension("deviceCategory", "activeUsers", 5);
export const getGaTopSources = () =>
  topByDimension("sessionSource", "sessions", 10);

/** Active users in the last 30 minutes (GA4 realtime). */
export const getGaRealtime = async (): Promise<number | null> => {
  const c = getClient();
  if (!c) return null;
  try {
    const [res] = await c.runRealtimeReport({
      property: property(),
      metrics: [{ name: "activeUsers" }],
    });
    return num(res.rows?.[0]?.metricValues?.[0]?.value);
  } catch {
    return null;
  }
};
