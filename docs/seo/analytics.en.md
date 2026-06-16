# Analytics playbook (PostHog · GA4 · Vercel · Search Console)

> A reusable, project-agnostic guide to instrumenting a web app. Companion to
> [`advanced-seo.en.md`](./advanced-seo.en.md). Goal: know **who** arrives
> (acquisition), **what** they do (product behavior), **how fast** the app feels
> (field performance), and **how** you rank (search) — without reinventing it per
> project.

**Contents**

- [0. Mental model — the four layers](#0-mental-model--the-four-layers)
- [1. PostHog — product analytics](#1-posthog--product-analytics)
- [2. Google Analytics 4 — acquisition & web](#2-google-analytics-4--acquisition--web)
- [3. Vercel Analytics & Speed Insights — RUM](#3-vercel-analytics--speed-insights--rum)
- [4. Google Search Console — the SEO tool](#4-google-search-console--the-seo-tool)
- [5. Which tool for which question](#5-which-tool-for-which-question)
- [6. Caching the dashboard reads](#6-caching-the-dashboard-reads)
- [7. Setup checklist](#7-setup-checklist)

See also: [`advanced-seo.en.md`](./advanced-seo.en.md) ·
[`glossary.en.md`](./glossary.en.md).

---

## 0. Mental model — the four layers

Analytics is not one tool. Pick one per layer; they answer different questions.

| Layer | Question | Tool (this stack) | Data lives in |
| --- | --- | --- | --- |
| **Product** | What do users *do* inside? | **PostHog** | PostHog cloud |
| **Acquisition / web** | Who comes, from where? | **Google Analytics 4** | Google |
| **Field performance (RUM)** | How fast for real users? | **Vercel Speed Insights** | Vercel |
| **Search** | What queries rank, where? | **Google Search Console** | Google |

**Critical principle: none of this is stored in *your* database.** Your DB holds
only first-party records you deliberately persist (accounts, saved items).
Analytics events are sent to the third-party service and **stored there**; your
app reads them back through each service's API to render an internal dashboard.
This keeps your DB small and your analytics provider swappable.

```
Browser ──capture()──▶ PostHog / GA servers ──Query API / Data API──▶ your /admin dashboard
                                   │
Your Postgres ◀── only explicit writes (accounts, saved calculations, favorites)
```

---

## 1. PostHog — product analytics

### What it is / what it gives / what it affects

- **What:** event-level, per-person product analytics.
- **Gives:** custom events, **session replay** (watch real sessions), **heatmaps**,
  **funnels**, **retention**, **feature flags + A/B experiments**, **surveys**.
- **Affects:** product decisions — where users drop in a flow, which feature is
  used, what to build next. It does *not* directly affect SEO ranking.

### How it works

1. The browser SDK (`posthog-js`) `init`s once and sends events to PostHog's
   ingestion host.
2. **Autocapture** records clicks, pageviews and form submits with zero code.
3. You add **custom events** for the things that matter (`signup_completed`,
   `checkout_started`, …).
4. `identify()` ties anonymous events to a user id so funnels/retention work.
5. You **read data back** with the **Query API (HogQL)** — SQL over your events —
   to build your own dashboards. Replays/heatmaps/funnels are viewed in the
   PostHog app.

### The functions you'll actually call

```ts
// client (posthog-js)
posthog.init(KEY, { api_host: "/ingest", ui_host: "https://us.posthog.com" })
posthog.capture("event_name", { any: "property" })   // custom event
posthog.identify(userId, { email, plan })             // attach to a person
posthog.reset()                                        // on logout
posthog.isFeatureEnabled("new-checkout")               // feature flag / A-B
posthog.group("company", orgId)                        // B2B group analytics

// server (posthog-node) — for events the client can't see reliably
const ph = new PostHog(KEY, { flushAt: 1, flushInterval: 0 })
ph.capture({ distinctId: userId, event: "signup_completed", properties })
await ph.flush()
```

A thin wrapper keeps call sites clean and SSR-safe:

```ts
// lib/analytics/track.ts
import posthog from "posthog-js";
export const track = (event: string, props?: Record<string, unknown>) => {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  posthog.capture(event, props);
};
```

### Setup (essential)

1. Create a project → copy the **Project API key** (`phc_…`). This is public
   (an *ingestion* key, safe in the browser) → `NEXT_PUBLIC_POSTHOG_KEY`.
2. Initialize once, high in the tree (client component):

   ```tsx
   "use client";
   import posthog from "posthog-js";
   posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
     api_host: "/ingest",              // first-party reverse proxy (see below)
     ui_host: "https://us.posthog.com",
     autocapture: true,
     capture_pageview: false,          // capture manually on route change in SPAs
     session_recording: { maskAllInputs: true },
   });
   ```

3. **Reverse proxy `/ingest` to beat ad blockers** (the single most impactful
   setup step — ad blockers blocklist `*.posthog.com`, silently dropping a large
   share of events). Send events to your own origin and forward them:

   ```ts
   // next.config.ts
   const nextConfig = {
     skipTrailingSlashRedirect: true,
     async rewrites() {
       return [
         { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
         { source: "/ingest/:path*",        destination: "https://us.i.posthog.com/:path*" },
       ];
     },
   };
   ```

   Now the browser only ever talks to `yoursite.com/ingest/*` — first-party, not
   blocked. (If you also run i18n/redirect middleware, exclude `/ingest` from it.)

4. **To read data into your own dashboard**, create a **Personal API key**
   (`phx_…`, server-only secret) and grab the **numeric Project ID**. Query with
   HogQL:

   ```ts
   const res = await fetch(`https://us.posthog.com/api/projects/${PROJECT_ID}/query`, {
     method: "POST",
     headers: { Authorization: `Bearer ${PERSONAL_API_KEY}`, "Content-Type": "application/json" },
     body: JSON.stringify({ query: { kind: "HogQLQuery", query:
       `SELECT event, count() FROM events
        WHERE timestamp >= now() - INTERVAL 30 DAY
        GROUP BY event ORDER BY 2 DESC LIMIT 10` } }),
     next: { revalidate: 300 },        // cache 5 min; stay under rate limits
   });
   ```

   > Two different hosts: events **ingest** at `us.i.posthog.com` (the `/ingest`
   > proxy); the **Query API** reads from `us.posthog.com`. Don't point the query
   > host at `/ingest`.

### Funnels in HogQL (`windowFunnel`)

A funnel measures how many people pass each ordered step and where they drop.
`windowFunnel(window_seconds)(timestamp, cond1, cond2, …)` returns the furthest
in-order step each person reached within the window:

```sql
SELECT
  countIf(level >= 1) AS visited,
  countIf(level >= 2) AS used_feature,
  countIf(level >= 3) AS signed_up
FROM (
  SELECT person_id,
    windowFunnel(604800)(  -- 7-day window
      timestamp,
      event = '$pageview',
      event = 'feature_used',
      event = 'signup_completed'
    ) AS level
  FROM events
  WHERE timestamp >= now() - INTERVAL 30 DAY
  GROUP BY person_id
)
```

The counts strictly decrease; the biggest gap is your biggest leak.

### Reachable objectives

Conversion funnels · feature adoption & retention · session replay to debug UX ·
heatmaps of real clicks · A/B experiments behind flags · in-app surveys ·
cohorts. Free tier is generous (≈1M events + 5k replays/mo); you pay for volume
and enterprise (SSO, group analytics, data pipelines, longer retention).

### Privacy

Honor Do-Not-Track, `maskAllInputs` in replays, and the first-party proxy keeps
requests same-origin. No PII unless you put it in `identify`.

---

## 2. Google Analytics 4 — acquisition & web

### What it is / what it gives / what it affects

- **What:** Google's web/marketing analytics.
- **Gives:** sessions, users, pageviews, **traffic sources/campaigns**, audience
  (country, device, language), conversions, plus Explore funnels.
- **Affects:** marketing/SEO decisions (where traffic comes from, which pages
  pull it). Integrates with Google Ads and Search Console.

### How it works — two halves

GA4 has a **write** side and a **read** side that use *different* identifiers:

| | Identifier | Purpose |
| --- | --- | --- |
| **Write (tag)** | **Measurement ID** `G-XXXXXXXX` | `gtag.js` *sends* events to GA |
| **Read (API)** | **Property ID** (numeric) | the **Data API** *reads* data back |

They belong to the same property but are not interchangeable — a common
setup mistake.

### Setup (essential)

1. **Write:** create a GA4 property → add a **Web** data stream → copy the
   **Measurement ID** → install the tag. In Next:

   ```tsx
   import { GoogleAnalytics } from "@next/third-parties/google";
   // in root layout, gated so it's off until configured:
   {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
   ```

2. **Read (optional, for an internal dashboard):**
   - Enable the **Google Analytics Data API** in Google Cloud.
   - Create a **service account**; download its **JSON key**.
   - In GA4 → Admin → **Property Access Management**, add the service-account
     email as **Viewer**.
   - Provide `GA4_PROPERTY_ID` (numeric) + the JSON inline as one env var.

   ```ts
   import { BetaAnalyticsDataClient } from "@google-analytics/data";
   const client = new BetaAnalyticsDataClient({
     credentials: JSON.parse(process.env.GA4_CREDENTIALS_JSON!),
   });
   const [res] = await client.runReport({
     property: `properties/${process.env.GA4_PROPERTY_ID}`,
     dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
     dimensions: [{ name: "country" }],
     metrics: [{ name: "activeUsers" }],
     orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
     limit: 10,
   });
   // runRealtimeReport() for active users in the last 30 min
   ```

### Strengths / limits

Strong on acquisition and the Google ecosystem; **but** data has processing
latency (hours), may be **sampled** on large ranges, and is aggregated (less
per-user detail than PostHog). Free tier includes **BigQuery export**; GA4 360
(enterprise) removes sampling and extends retention.

---

## 3. Vercel Analytics & Speed Insights — RUM

- **Vercel Analytics** — privacy-friendly pageviews/events, no cookie banner,
  zero-config on Vercel.
- **Vercel Speed Insights** — **real-user Core Web Vitals** (LCP/CLS/INP). This is
  the **SEO-relevant** field data Google actually uses for ranking.

```tsx
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
// render both once in the root layout
```

Lab tools (Lighthouse) estimate; Speed Insights measures the **field** — track
both, but field wins.

---

## 4. Google Search Console — the SEO tool

Not "analytics" in the JS sense; it's how you see your **search** presence. Do
this **first** — it's the highest-leverage SEO step.

- Add the domain as a property; verify (DNS TXT or the `verification.google`
  meta tag).
- Submit `https://yoursite.com/sitemap.xml`.
- Watch: **Performance** (queries, impressions, CTR, average position), **Pages**
  (index coverage), **Enhancements** (FAQ/Breadcrumb rich-result validity).
- It has an API too — you can pull query/position data into the same internal
  dashboard alongside GA4 + PostHog.

---

## 5. Which tool for which question

| You want to know… | Use |
| --- | --- |
| Where traffic comes from (organic/referral/campaign) | GA4 |
| Which search queries you rank for + position | Search Console |
| Whether real users hit good Core Web Vitals | Vercel Speed Insights |
| Where users drop in a signup/checkout flow | PostHog funnel |
| What a confused user actually did | PostHog session replay |
| Which buttons get clicked | PostHog heatmap / autocapture |
| Whether variant B converts better | PostHog experiment (feature flag) |

Overlap is fine and even useful (GA and PostHog both count pageviews) — running
both teaches you each tool's latency, sampling and strengths.

---

## 6. Caching the dashboard reads

Both the HogQL and GA Data API calls are **expensive aggregate reads** that don't
need to be real-time on an admin page. Cache them, but keep them fresh enough to
feel live:

```ts
// fetch-based (PostHog HogQL): tag + revalidate on the request
fetch(url, { next: { revalidate: 300, tags: ["metrics:posthog"] } })

// non-fetch reads (DB aggregates): wrap once
export const getMetrics = unstable_cache(load, ["metrics"], {
  revalidate: 300, tags: ["metrics:db"],
});
// invalidate from a Server Action after a relevant write:
updateTag("metrics:db");   // Next 16 single-arg invalidator
```

A common gotcha: a long `revalidate` (e.g. 1 hour) makes a freshly-deployed
analytics panel look "frozen" while a sibling uncached panel looks live. Match
their freshness (≈5 min) so comparisons are fair.

---

## 7. Setup checklist

- [ ] PostHog project API key set; SDK initialized once with autocapture.
- [ ] **`/ingest` reverse proxy** live (verify in DevTools → Network: events 200
      to your own origin, not `*.posthog.com`).
- [ ] Custom events named consistently (`snake_case`), `identify` on login,
      `reset` on logout.
- [ ] PostHog Personal API key + numeric Project ID set for the dashboard reads.
- [ ] GA4 Measurement ID (`G-…`) installed; tag firing (Realtime shows you).
- [ ] GA4 Data API enabled + service account (Viewer) + numeric Property ID for
      the dashboard.
- [ ] Vercel Analytics + Speed Insights rendered in the root layout.
- [ ] Search Console verified + sitemap submitted.
- [ ] Dashboard reads cached (~5 min) and tag-invalidated on writes.
- [ ] Privacy: DNT honored, replay inputs masked, no PII in events.
