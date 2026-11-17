import "server-only";

import { createApiClient } from "@/lib/cache/api";
import { tags } from "@/lib/cache/tags";

import { createLimiter } from "./limiter";

const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;
// Query API host (reads data back out). Kept separate from the client's ingest
// proxy: the browser sends events to `/relay`, but server-side HogQL must hit
// PostHog's API host directly. Override with POSTHOG_API_HOST for non-US clouds.
const host = (process.env.POSTHOG_API_HOST || "https://us.posthog.com").replace(
  /\/$/,
  "",
);

export const posthogConfigured = () => Boolean(apiKey && projectId);

const api = createApiClient({
  baseUrl: host,
  tag: tags.metrics.posthog,
  headers: () =>
    apiKey && projectId
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        }
      : null,
});

/** PostHog runs a handful of queries per project at a time; a dashboard asks
 * for a dozen in one render. */
const limit = createLimiter(3);

export type HogValues = Record<string, string | number>;
export type HogRow = unknown[];

/**
 * POST a HogQL query to the PostHog Query API and return its rows. Anything
 * that varies per request goes in `values` and is referenced as `{name}`, so
 * the SQL text only ever holds constants. Returns null when unconfigured or on
 * any failure: the personal API key never reaches the client and errors never
 * bubble to the page.
 */
export const runHogQL = async (
  query: string,
  values: HogValues = {},
): Promise<HogRow[] | null> => {
  const json = await limit(() =>
    api.request<{ results?: unknown }>(`/api/projects/${projectId}/query/`, {
      method: "POST",
      body: JSON.stringify({ query: { kind: "HogQLQuery", query, values } }),
    }),
  );
  return Array.isArray(json?.results) ? (json.results as HogRow[]) : null;
};

export const toNum = (v: unknown): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/** HogQL returns a boolean column as `true`, `1` or `"true"` depending on
 * the engine path. */
export const toBool = (v: unknown): boolean =>
  v === true || v === 1 || v === "true";

export const toStr = (v: unknown): string =>
  v === null || v === undefined ? "" : String(v);
