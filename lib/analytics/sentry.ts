import "server-only";

import { createApiClient } from "@/lib/cache/api";
import { tags } from "@/lib/cache/tags";

import {
  parseDiscover,
  parseIssues,
  type SentryIssue,
  sentryPeriod,
  statsSeries,
  statsTotal,
} from "./errors";
import { type AnalyticsWindow, fillDays } from "./range";
import {
  simSentryBreakdown,
  simSentryDaily,
  simSentryIssues,
  simSentryTotals,
  simulating,
} from "./simulate";

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
// EU-hosted organizations read from https://de.sentry.io.
const API = `${(process.env.SENTRY_API_HOST || "https://sentry.io").replace(/\/$/, "")}/api/0`;

export const sentryConfigured = (): boolean => Boolean(token);

const api = createApiClient({
  baseUrl: API,
  tag: tags.metrics.sentry,
  headers: () => (token ? { Authorization: `Bearer ${token}` } : null),
});

/** No Sentry token on a dev server: every reader answers with made-up data. */
const simulated = () => simulating(sentryConfigured());

const sentryFetch = (path: string): Promise<unknown | null> =>
  api.request<unknown>(path);

/** Org-scoped endpoints filter by numeric project id, not slug. */
const projectId = async (): Promise<string | null> => {
  const data = (await sentryFetch(`/projects/${org}/${project}/`)) as {
    id?: string;
  } | null;
  return data?.id ? String(data.id) : null;
};

const STATS = `field=sum(quantity)&category=error&outcome=accepted&groupBy=outcome`;

export type SentryErrorTotals = { last24h: number; last14d: number };

/** Accepted error events for the last 24 hours and 14 days, whatever the
 * dashboard's window: the two numbers worth glancing at every day. */
export const getSentryErrorTotals =
  async (): Promise<SentryErrorTotals | null> => {
    if (simulated()) return simSentryTotals();
    if (!token) return null;
    const id = await projectId();
    if (!id) return null;
    const base = `/organizations/${org}/stats_v2/?${STATS}&project=${id}`;
    const [day, twoWeeks] = await Promise.all([
      sentryFetch(`${base}&statsPeriod=24h&interval=1h`),
      sentryFetch(`${base}&statsPeriod=14d&interval=1d`),
    ]);
    if (day === null || twoWeeks === null) return null;
    return { last24h: statsTotal(day), last14d: statsTotal(twoWeeks) };
  };

/** Errors per day across the window (at most the last 90 days). */
export const getSentryDaily = async (
  window: AnalyticsWindow,
  today: string,
): Promise<{ date: string; value: number }[] | null> => {
  if (simulated()) return simSentryDaily(sentryPeriod(window, today).window);
  if (!token) return null;
  const id = await projectId();
  if (!id) return null;
  const period = sentryPeriod(window, today);
  const json = await sentryFetch(
    `/organizations/${org}/stats_v2/?${STATS}&project=${id}&interval=1d&${period.query}`,
  );
  if (json === null) return null;
  return fillDays(period.window, statsSeries(json));
};

/** Unresolved issues seen in the window, most events first. */
export const getTopSentryIssues = async (
  window: AnalyticsWindow,
  today: string,
  limit = 10,
): Promise<SentryIssue[] | null> => {
  if (simulated()) return simSentryIssues(window, limit);
  if (!token) return null;
  const id = await projectId();
  if (!id) return null;
  const { query } = sentryPeriod(window, today);
  return parseIssues(
    await sentryFetch(
      `/organizations/${org}/issues/?project=${id}&query=is:unresolved&sort=freq&limit=${limit}&collapse=stats&${query}`,
    ),
  );
};

const DISCOVER_FIELDS = {
  release: "release",
  browser: "browser.name",
  page: "transaction",
  os: "os.name",
} as const;

export type SentryBreakdownId = keyof typeof DISCOVER_FIELDS;

/** Error events grouped by one field (release, browser, route, OS). */
export const getSentryBreakdown = async (
  id: SentryBreakdownId,
  window: AnalyticsWindow,
  today: string,
): Promise<{ label: string; value: number }[] | null> => {
  if (simulated()) return simSentryBreakdown(id, window);
  if (!token) return null;
  const pid = await projectId();
  if (!pid) return null;
  const field = DISCOVER_FIELDS[id];
  const { query } = sentryPeriod(window, today);
  const q = encodeURIComponent(`event.type:error has:${field}`);
  return parseDiscover(
    await sentryFetch(
      `/organizations/${org}/events/?field=${encodeURIComponent(field)}&field=count()&query=${q}&sort=-count()&per_page=8&project=${pid}&${query}`,
    ),
    field,
  );
};
