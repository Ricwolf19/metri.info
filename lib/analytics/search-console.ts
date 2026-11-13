import "server-only";

import { JWT } from "google-auth-library";
import { cacheLife, cacheTag } from "next/cache";

import sitemap from "@/app/sitemap";
import { retryOnRateLimit, UPSTREAM_TIMEOUT_MS } from "@/lib/cache/api";
import { tags } from "@/lib/cache/tags";

import { googleServiceAccount } from "./google-account";
import { createLimiter } from "./limiter";
import type { AnalyticsWindow } from "./range";
import {
  type Inspection,
  parseInspection,
  parseSearchRows,
  parseSitemaps,
  type SearchRow,
  type Sitemap,
} from "./search";
import {
  simInspections,
  simSearchRows,
  simSitemaps,
  simulating,
} from "./simulate";

/**
 * Google Search Console, read-only: search analytics, submitted sitemaps and
 * the URL Inspection API for every URL in our sitemap.
 *
 * Setup: add the GA4 service account (`client_email` in GA4_CREDENTIALS_JSON)
 * as a user on the Search Console property, then set GSC_SITE_URL to the
 * property exactly as Search Console names it (`sc-domain:metri.info` for a
 * domain property, `https://metri.info/` for a URL-prefix one).
 *
 * Cached with `use cache: remote`, not `fetch`'s data cache: the access token
 * rotates hourly and is part of a fetch cache key, which would re-inspect
 * every URL each hour and burn the 2,000-a-day inspection quota. A failed
 * read throws inside the cache scope (never cached) and becomes null outside.
 */

const siteUrl = process.env.GSC_SITE_URL;
const API = "https://searchconsole.googleapis.com";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

export const searchConsoleConfigured = () =>
  Boolean(siteUrl && process.env.GA4_CREDENTIALS_JSON);

let jwt: JWT | null = null;

const gscFetch = async (path: string, body?: unknown): Promise<unknown> => {
  const account = googleServiceAccount();
  if (!siteUrl || !account) throw new Error("Search Console not configured");
  jwt ??= new JWT({
    email: account.client_email,
    key: account.private_key,
    scopes: [SCOPE],
  });
  const { token } = await jwt.getAccessToken();
  const send = () =>
    fetch(`${API}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  const res = await retryOnRateLimit(send);
  if (!res.ok) throw new Error(`Search Console ${res.status} on ${path}`);
  return res.json();
};

const site = () => encodeURIComponent(siteUrl ?? "");

/** Null instead of a throw: the card says Search Console didn't answer. */
const orNull = async <T>(read: () => Promise<T>): Promise<T | null> => {
  if (!searchConsoleConfigured()) return null;
  try {
    return await read();
  } catch {
    return null;
  }
};

type Dimension = "date" | "query" | "page" | "country" | "device";

const querySearchCached = async (
  startDate: string,
  endDate: string,
  dimensions: Dimension[],
  rowLimit: number | undefined,
): Promise<SearchRow[]> => {
  "use cache: remote";
  cacheTag(tags.metrics.gsc);
  // Final data lands once a day; an hour is plenty fresh.
  cacheLife("hours");
  const json = await gscFetch(
    `/webmasters/v3/sites/${site()}/searchAnalytics/query`,
    {
      startDate,
      endDate,
      type: "web",
      dataState: "final",
      ...(dimensions.length ? { dimensions } : {}),
      ...(rowLimit ? { rowLimit } : {}),
    },
  );
  return parseSearchRows(json);
};

/** No Search Console keys on a dev server: made-up data instead. */
const simulated = () => simulating(searchConsoleConfigured());

export const querySearch = async (
  window: Pick<AnalyticsWindow, "startDate" | "endDate" | "days">,
  dimensions: Dimension[] = [],
  rowLimit?: number,
): Promise<SearchRow[] | null> =>
  simulated()
    ? simSearchRows(window, dimensions, rowLimit)
    : orNull(() =>
        querySearchCached(
          window.startDate,
          window.endDate,
          dimensions,
          rowLimit,
        ),
      );

const sitemapsCached = async (): Promise<Sitemap[]> => {
  "use cache: remote";
  cacheTag(tags.metrics.gsc);
  cacheLife("hours");
  return parseSitemaps(
    await gscFetch(`/webmasters/v3/sites/${site()}/sitemaps`),
  );
};

export const getSitemaps = async (): Promise<Sitemap[] | null> =>
  simulated()
    ? simSitemaps(new Date(), (await sitemap()).length)
    : orNull(sitemapsCached);

const inspectCached = async (url: string): Promise<Inspection | null> => {
  "use cache: remote";
  cacheTag(tags.metrics.gsc);
  // Google recrawls on its own schedule; once a day per URL keeps a full
  // sweep (EN + ES) far under the 2,000-a-day quota.
  cacheLife("days");
  return parseInspection(
    url,
    await gscFetch("/v1/urlInspection/index:inspect", {
      inspectionUrl: url,
      siteUrl,
    }),
  );
};

/** 600 inspections a minute is the cap; five at a time stays well under. */
const inspectLimit = createLimiter(5);

export type CoverageSweep = {
  inspections: Inspection[];
  /** Sitemap URLs Google didn't answer for this time. */
  failed: number;
  total: number;
};

/** Every sitemap URL through URL Inspection: what the Page indexing report
 * says about each one, not a sample. */
export const getIndexCoverage = async (): Promise<CoverageSweep | null> => {
  if (simulated()) {
    const urls = (await sitemap()).map((e) => e.url);
    return {
      inspections: simInspections(urls, new Date()),
      failed: 0,
      total: urls.length,
    };
  }
  return orNull(async (): Promise<CoverageSweep> => {
    const urls = (await sitemap()).map((e) => e.url);
    const results = await Promise.all(
      urls.map((url) =>
        inspectLimit(() => inspectCached(url)).catch(() => null),
      ),
    );
    const inspections = results.filter((r): r is Inspection => r !== null);
    if (inspections.length === 0 && urls.length > 0)
      throw new Error("No URL inspection answered");
    return {
      inspections,
      failed: urls.length - inspections.length,
      total: urls.length,
    };
  });
};
