import "server-only";

import { createApiClient } from "@/lib/cache/api";
import { tags } from "@/lib/cache/tags";

/**
 * Sentry admin reads via the Sentry Web API (https://sentry.io/api/0/).
 *
 * Auth: `SENTRY_API_TOKEN` — a **User Auth Token** (or Internal Integration)
 * with `event:read project:read org:read`. This is NOT the same as
 * `SENTRY_AUTH_TOKEN` (the build-time Organization Auth Token used by
 * `withSentryConfig` to upload source maps — those org tokens can't read
 * issues). Org/project default to the values wired in `next.config.ts` and can
 * be overridden via `SENTRY_ORG` / `SENTRY_PROJECT`.
 *
 * Every read returns `null` on missing config or any failure — the token never
 * reaches the client and errors never bubble to the page (same contract as the
 * PostHog / GA panels).
 */
const token = process.env.SENTRY_API_TOKEN;
const org = process.env.SENTRY_ORG || "metri-ku";
const project = process.env.SENTRY_PROJECT || "javascript-nextjs";
const API = "https://sentry.io/api/0";

export const sentryConfigured = (): boolean => Boolean(token);

const api = createApiClient({
  baseUrl: API,
  tag: tags.metrics.sentry,
  headers: () => (token ? { Authorization: `Bearer ${token}` } : null),
});

const sentryFetch = (path: string): Promise<unknown | null> =>
  api.request<unknown>(path);

export type SentryErrorTotals = { last24h: number; last14d: number } | null;

type StatsV2 = {
  groups?: { totals?: Record<string, number> }[];
};

const sumQuantity = (data: unknown): number => {
  const groups = (data as StatsV2 | null)?.groups ?? [];
  return groups.reduce(
    (acc, g) => acc + Number(g.totals?.["sum(quantity)"] ?? 0),
    0,
  );
};

/** Error-event volume for the last 24h and 14d via the org `stats_v2` endpoint. */
export const getSentryErrorTotals = async (): Promise<SentryErrorTotals> => {
  if (!token) return null;
  const base = `/organizations/${org}/stats_v2/?field=sum(quantity)&category=error`;
  const [day, twoWeeks] = await Promise.all([
    sentryFetch(`${base}&statsPeriod=24h&interval=1h`),
    sentryFetch(`${base}&statsPeriod=14d&interval=1d`),
  ]);
  if (day === null && twoWeeks === null) return null;
  return { last24h: sumQuantity(day), last14d: sumQuantity(twoWeeks) };
};

export type SentryIssue = {
  id: string;
  title: string;
  culprit: string;
  count: number;
  permalink: string;
  lastSeen: string;
};

type RawIssue = {
  id: string;
  title?: string;
  culprit?: string;
  count?: string | number;
  permalink?: string;
  lastSeen?: string;
};

/** Top unresolved issues over the last 14 days, ordered by event frequency. */
export const getTopSentryIssues = async (
  limit = 8,
): Promise<SentryIssue[] | null> => {
  const data = await sentryFetch(
    `/projects/${org}/${project}/issues/?query=is:unresolved&statsPeriod=14d&sort=freq&limit=${limit}`,
  );
  if (!Array.isArray(data)) return null;
  return (data as RawIssue[]).map((i) => ({
    id: i.id,
    title: i.title ?? "(untitled)",
    culprit: i.culprit ?? "",
    count: Number(i.count ?? 0),
    permalink: i.permalink ?? `https://${org}.sentry.io/issues/`,
    lastSeen: i.lastSeen ?? "",
  }));
};
