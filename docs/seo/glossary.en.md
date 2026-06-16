# SEO & web-analytics glossary

> A quick-reference glossary of the SEO, structured-data, rendering and
> analytics terms used across this project's docs. Companion to
> [`advanced-seo.en.md`](./advanced-seo.en.md) and
> [`analytics.en.md`](./analytics.en.md). Each entry says **what** a term is and
> **why it matters / what it affects** — concise, practical, project-agnostic.

Entries are grouped into five sections; within each section they're **ordered
alphabetically**.

- [SEO & content](#seo--content)
- [Structured data](#structured-data)
- [Rendering & Next.js](#rendering--nextjs)
- [Core Web Vitals & performance](#core-web-vitals--performance)
- [Analytics & instrumentation](#analytics--instrumentation)

---

## SEO & content

**Canonical URL** — The one "official" URL for a piece of content, declared with
`<link rel="canonical">` (or `alternates.canonical` in Next metadata). It tells
search engines which URL to index when several can show the same content (param
variants, `www`/trailing-slash, `http`/`https`). Consolidates duplicate signals
so ranking strength isn't split.

**Crawl budget** — The number of URLs a search engine is willing to crawl on
your site in a given window. Wasting it on infinite param URLs, redirects or
thin pages means important pages get crawled (and refreshed) less often. Matters
mostly for large sites; keep junk URLs out via `robots.txt` and `noindex`.

**CTR (click-through rate)** — Clicks ÷ impressions for a result in the SERP. A
strong **title tag**, **meta description** and **rich results** lift it. It's
both a success metric (more traffic per ranking) and a likely soft ranking
signal — a page that's shown often but rarely clicked may slip.

**E-E-A-T** — Experience, Expertise, Authoritativeness, Trustworthiness:
Google's quality framework for judging content and its author/site. Not a direct
score, but the rater guideline that shapes ranking — especially for **YMYL**
topics. Demonstrate it with a real author, cited sources, an About page and
"last reviewed" dates.

**Featured snippet** — An answer box at the top of the SERP (position "zero")
that quotes a page directly. Won by concise, well-structured answers (a clear
definition paragraph, a list, or a table) to a question query. Big CTR upside,
though it can also satisfy the query without a click.

**hreflang** — A tag declaring the language/region variants of a page, e.g.
`<link rel="alternate" hreflang="es" href="…">`. It tells Google to serve the
right language version and stops your own EN/ES pages from competing. Must be
**reciprocal** (each variant points back) and include **x-default**.

**Impressions** — How many times a page appeared in search results for users
(whether or not it was clicked). Reported in Search Console; the denominator of
**CTR**. Rising impressions with flat clicks usually means you rank, but not
high enough or with a weak snippet.

**Indexation** — Whether a URL is actually stored in the search engine's index
and thus eligible to rank. A page can be crawled but not indexed (thin content,
`noindex`, duplicate). Check coverage in Search Console's Pages report; if it's
not indexed, it cannot rank for anything.

**Internal linking** — Links between your own pages. Spreads link equity (ranking
strength) across the site and signals which pages are important and how they
relate. Tightly linking the pages of one topic is what builds a **topical
cluster**.

**Keyword** — A query (word or phrase) users type that you want a page to rank
for. It guides the page's **slug**, **title tag**, H1 and copy. Modern SEO
targets the *intent* behind a keyword and its synonyms, not literal repetition
(which reads as spam).

**Meta description** — The `<meta name="description">` snippet shown under the
title in the SERP. Not a ranking factor, but a major **CTR** lever: a clear,
benefit-led sentence with the keyword earns clicks. Keep it ≤ ~160 characters or
Google truncates it (and may rewrite it anyway).

**noindex / nofollow** — Robots directives. `noindex` keeps a URL out of the
index (use on thin/duplicate/param pages); `nofollow` tells engines not to pass
ranking credit through a link (or, on `<meta robots>`, not to follow the page's
links). An accidental `noindex` in production silently tanks traffic.

```ts
export const metadata = { robots: { index: false, follow: true } };
```

**Rich results / rich snippets** — SERP listings enhanced with extra visuals
from **structured data**: FAQ accordions, breadcrumbs, star ratings, sitelinks.
They take more vertical space and lift **CTR**. Only mark up content that is
actually visible on the page, or it's a guidelines violation.

**robots.txt** — A file at `/robots.txt` giving crawlers site-wide allow/disallow
rules and the sitemap location. It controls **crawling**, not indexing — a
disallowed page can still be indexed if linked elsewhere (use `noindex` to keep
it out of results). Disallow `/api/`, auth and `?param` result URLs.

**SearchAction / sitelinks searchbox** — `WebSite` + `SearchAction` JSON-LD that
tells Google your site has internal search, potentially rendering a search box
inside your branded SERP listing. A homepage-level enhancement; affects how your
brand result looks and how users jump straight into your site.

**SERP** — Search Engine Results Page: the page of results for a query. It mixes
organic links, ads, and *features* (featured snippets, People Also Ask, image/
video packs, knowledge panels). Your real competition is everything on it, not
just the page ranked above you.

**Sitemap** — An XML file (`/sitemap.xml`) listing your indexable URLs, each with
`lastModified`, priority and per-URL **hreflang** alternates. Speeds up complete,
fresh discovery — especially for new or deep pages. Submit it in Search Console.

```ts
// app/sitemap.ts
export default function sitemap() {
  return ROUTES.map((r) => ({ url: abs(r.en), lastModified: new Date() }));
}
```

**Slug** — The human-readable, URL-path portion identifying a page, e.g.
`ffmi-calculator` in `/tools/ffmi-calculator`. A keyword-in-slug is a ranking and
**CTR** signal; localized slugs (`/es/herramientas/calculadora-ffmi`) win
language-specific SERPs. Keep them short, lowercase and hyphenated.

**Title tag** — The `<title>` element (set via `title` in metadata), shown as the
clickable SERP headline and the browser-tab label. The single strongest on-page
relevance signal *and* the primary **CTR** driver. Keep it ≤ ~60 characters,
unique per page, with the keyword near the front.

**Topical cluster** — A group of related pages covering one subject in depth,
interlinked around a hub. Signals topical authority, so the whole cluster ranks
better than isolated pages would. Built with **internal linking** between a
pillar page and its supporting articles/tools.

**x-default** — The special **hreflang** value naming the fallback page for users
whose language/region you don't explicitly target. Include it in every set of
language alternates so unmatched visitors land somewhere sensible instead of a
mismatched locale.

```ts
languages: { en: "/tools/x", es: "/es/herramientas/x", "x-default": "/tools/x" }
```

**YMYL** — "Your Money or Your Life": content that could affect a person's health,
finances, safety or wellbeing (medical, legal, financial). Google holds it to a
much higher **E-E-A-T** bar. Fitness/health calculators qualify, so they need
cited sources, an author and a disclaimer to rank.

---

## Structured data

**Article** — schema.org type for a news, blog or knowledge-base post. Supplies
headline, author, publish/modified dates and image to search engines, enabling
article rich results and feeding **E-E-A-T** signals. Use `MedicalWebPage`
instead (or additionally) for health content.

**BreadcrumbList** — schema.org type describing the page's position in the site
hierarchy (Home › Tools › FFMI Calculator). Renders a breadcrumb trail in the
SERP instead of a raw URL, clarifying context and lifting **CTR**. Cheap to add
to any deep page.

**FAQPage** — schema.org type marking up a list of question/answer pairs. The
highest-leverage **rich result** for tool/content pages — it can show an
expandable FAQ directly in the SERP, taking extra space. Only mark up FAQs
actually visible on the page.

```json
{ "@type": "FAQPage", "mainEntity": [
  { "@type": "Question", "name": "…", "acceptedAnswer": { "@type": "Answer", "text": "…" } }
]}
```

**JSON-LD** — JavaScript Object Notation for Linked Data: the recommended format
for **structured data**, emitted as a `<script type="application/ld+json">` block
(ideally server-rendered). Keeps machine-readable markup separate from visible
HTML, which is cleaner than inline microdata.

**LocalBusiness** — schema.org type for a physical business (name, address, hours,
geo, phone). Powers local-pack and map rich results and the business knowledge
panel. Relevant when a site represents a real-world location; skip it for purely
digital tools.

**MedicalWebPage** — schema.org type for medical/health content, optionally with
`reviewedBy`, `lastReviewed` and cited `citation`s. Signals the trust that
**YMYL** ranking demands. Pair it with **Article** and real sources on health
calculators and medical docs.

**Organization** — schema.org type describing the entity behind the site (legal
name, logo, social profiles, contact). Usually emitted once on the homepage; it
seeds the brand **knowledge panel** and links your social/identity signals into
one entity.

**Product** — schema.org type for a sellable item (name, image, price, currency,
availability, `AggregateRating`/`Review`). Enables price, stock and star-rating
rich results that strongly affect **CTR** on commercial queries. Reviews must be
genuine and on-page.

**schema.org** — The shared, cross-engine vocabulary of types (`Article`,
`Product`, `FAQPage`, …) and properties used to describe page content to
machines. It's the dictionary; **JSON-LD** is how you write it down. Validate
markup with the Schema Markup Validator and Google's Rich Results Test.

**SoftwareApplication** — schema.org type for an app or interactive tool (name,
category, operating system, price, rating). The natural type for a calculator or
web app; can earn rich results and clarifies to engines that the page *is* a
usable tool. `WebApplication` is a more specific subtype.

**WebSite** — schema.org type representing the site as a whole, carrying its name
and (with **SearchAction**) the sitelinks searchbox. Emitted once on the
homepage alongside **Organization**; helps Google show your brand name and a
search box in the SERP.

---

## Rendering & Next.js

**Client island** — A small `"use client"` interactive component embedded in an
otherwise server-rendered page. Keeps the JS shipped to the browser minimal so
the page stays fast and indexable while still being interactive (e.g. a
calculator widget inside a static content page).

**generateMetadata** — A Next.js App Router async function that returns a page's
`<title>`, description, canonical, OG, etc. *per request/param*. Use it whenever
metadata varies by route (one calculator vs another); use the static `metadata`
export when it's fixed.

```ts
export const generateMetadata = async ({ params }) => ({ title: getCalc(params.slug).title });
```

**Hydration** — The client-side process where React attaches event handlers to
the server-rendered HTML, making it interactive. Until it finishes the page looks
ready but isn't clickable; heavy hydration hurts **INP**. Smaller **client
islands** mean less to hydrate.

**ISR (Incremental Static Regeneration)** — Serving a statically generated page,
then regenerating it in the background after a `revalidate` interval (or on
demand). Combines **SSG** speed with freshness, so content updates without a full
rebuild. Set via `export const revalidate = 3600` or fetch options.

**manifest / PWA** — The web app manifest (`app/manifest.ts` → `/manifest.webmanifest`)
declares name, icons and theme color so the site is installable as a Progressive
Web App. With a service worker it enables offline use and an app-like launch;
also feeds some SERP/app presentation.

**metadataBase** — The absolute base `URL` set in root metadata so relative
canonical and **OG image** paths resolve to absolute URLs. Without it, social
previews and canonicals can break. Set it once in the root layout.

```ts
export const metadata = { metadataBase: new URL("https://example.com") };
```

**middleware / proxy** — Code (Next.js Middleware) that runs *before* a request is
served, for redirects, rewrites, auth or locale routing. Powerful but it makes
pages non-static and adds latency on every request — prefer static routing where
possible, and exclude paths like the analytics `/ingest` rewrite.

**Open Graph (OG) image** — The preview card image shown when a link is shared on
social or in some SERP features, generated per route via `opengraph-image.tsx`
(Next's `ImageResponse`, 1200×630). Makes shared links look intentional and
branded — a real **CTR** lever.

**reverse proxy** — A server that receives requests at your own origin and
forwards them to a third party. Used to serve analytics from a first-party path
(e.g. rewrite `/ingest/*` to PostHog) so **ad blockers** that blocklist
`*.posthog.com` don't drop events. The browser only ever sees your domain.

**Server Component (RSC)** — A React component that renders only on the server and
ships zero JS to the client. The App Router default; everything SEO-critical
(headings, copy, links, structured data) should be one so it's in the initial
HTML. Interactivity goes in **client islands**.

**SSG (Static Site Generation)** — Rendering pages to HTML at build time, then
serving them from the edge/CDN. Gives the fastest **TTFB**/**LCP** and fully-
formed HTML for crawlers. The preferred mode for content and tool pages here.

**SSR (Server-Side Rendering)** — Rendering a page's HTML on the server *per
request*. Crawler-friendly like **SSG**, but slower (work happens on each hit) —
use it when content is request-specific (personalized, real-time) rather than
cacheable.

---

## Core Web Vitals & performance

**CLS (Cumulative Layout Shift)** — A **Core Web Vital** measuring unexpected
layout movement as the page loads (target < 0.1). Caused by images/ads/fonts
without reserved space. Fixed media dimensions and `font-display: swap` with
matched fallback metrics keep it low.

**Core Web Vitals (CWV)** — Google's set of real-user (field) UX metrics — **LCP**,
**CLS** and **INP** — used as a ranking signal and a UX health check. "Good"
thresholds: LCP < 2.5s, CLS < 0.1, INP < 200ms. Measured from real visitors, not
just lab runs.

**FID (First Input Delay)** — *Deprecated.* The former **Core Web Vital** for
input responsiveness (delay before the first interaction was processed).
**Replaced by INP** in March 2024, which measures responsiveness across the whole
visit rather than only the first input. Mentioned only because older guides still
cite it.

**INP (Interaction to Next Paint)** — The **Core Web Vital** for responsiveness
(target < 200ms): the latency from a user interaction to the next visual update,
across all interactions in a visit. High INP usually means too much main-thread
JS — shrink **client islands** and defer non-critical scripts.

**Lab vs field data** — Two ways to measure performance. *Lab* (synthetic, e.g.
**Lighthouse**) runs in a controlled environment — reproducible, good for
debugging. *Field* (**RUM**, real visitors) reflects actual devices/networks and
is what Google ranks on. Track both; field wins on disagreement.

**LCP (Largest Contentful Paint)** — The **Core Web Vital** marking when the
largest visible element (usually the hero image or heading block) finishes
rendering (target < 2.5s). The headline "is it loaded yet?" metric. Improve with
**SSG** + edge delivery, optimized images and `next/font`.

**Lighthouse** — Google's open-source auditing tool (in Chrome DevTools / PageSpeed
Insights) scoring Performance, SEO, Accessibility and Best Practices on a single
**lab** run. Great for catching regressions pre-launch; remember its CWV numbers
are estimates, not the **field** data used for ranking.

**RUM (Real-User Monitoring)** — Collecting performance metrics from actual
visitors' browsers rather than synthetic tests — i.e. **field** data. It captures
the spread of real devices and networks, which is exactly what **Core Web
Vitals** ranking uses. Vercel Speed Insights is the RUM tool in this stack.

**TTFB (Time To First Byte)** — The time from request to the first byte of the
response arriving. Not a Core Web Vital itself but a foundation for **LCP** — a
slow TTFB delays everything. **SSG** served from the edge/CDN drives it down
(target < ~600ms).

---

## Analytics & instrumentation

**A/B experiment** — Splitting traffic between two (or more) variants to measure
which performs better on a metric, usually gated behind a **feature flag**. Turns
"I think B is better" into a measured decision. In this stack, run via PostHog
experiments.

**Autocapture** — PostHog's mode that records clicks, pageviews and form submits
automatically with no per-event code. Gives instant baseline coverage and powers
**heatmaps**; the trade-off is noisier data and less semantic naming than
**custom events**.

**Cohort** — A group of users defined by a shared trait or action (e.g. "signed up
in May", "used the calculator"). Used to segment **funnels**, **retention** and
other reports so you compare like with like instead of one undifferentiated
average.

**Custom event** — An explicitly named event you fire for a meaningful action,
e.g. `posthog.capture("signup_completed", { plan })`. More precise and
analysis-friendly than **autocapture**; the backbone of **funnels** and
conversion tracking. Name consistently (`snake_case`).

**Distinct ID** — The identifier PostHog uses to tie events to one person. It
starts as an anonymous device ID and, after **identify**, merges into your stable
user ID — so a person's pre- and post-login activity stitches into one timeline.

**DNT (Do-Not-Track)** — A browser signal (`navigator.doNotTrack`) asking sites not
to track the user. Honoring it (skipping or anonymizing capture) is a privacy and
sometimes compliance practice. PostHog can be configured to respect it.

**event** — The atomic unit of product analytics: a named record that something
happened (a pageview, click, or **custom event**), with a timestamp, a **distinct
ID** and arbitrary properties. Everything downstream — funnels, retention,
heatmaps — is computed from the event stream.

**Feature flag** — A remote on/off (or multivariate) switch that toggles a feature
for chosen users without a deploy. Enables gradual rollouts, kill switches and the
variant assignment behind an **A/B experiment**. Checked with
`posthog.isFeatureEnabled("new-checkout")`.

**Funnel** — An ordered sequence of steps (visit → use feature → sign up) that
shows how many people reach each step and where they drop. The biggest step-to-
step gap is your biggest leak. In HogQL, built with
`windowFunnel(window_seconds)(timestamp, cond1, cond2, …)`.

**gtag** — The Google global site tag (`gtag.js`) that *sends* events to **GA4**
using the **Measurement ID**. It's the write side of GA4; in Next it's loaded via
`@next/third-parties`' `GoogleAnalytics` component. Distinct from the Data API
that reads data back.

**Heatmap** — A visual overlay aggregating where users click, move and scroll on a
page. Reveals what actually draws attention or gets ignored without reading raw
events. Powered by PostHog's **autocapture**.

**HogQL** — PostHog's SQL dialect for querying your raw event data through the
Query API. Lets you build custom metrics and dashboards (e.g. `SELECT event,
count() FROM events GROUP BY event`) beyond the canned reports. Reads from
`us.posthog.com`, not the `/ingest` proxy.

**identify** — The call (`posthog.identify(userId, traits)`) that associates the
current anonymous **distinct ID** with a known user and attaches traits (email,
plan). Run it on login so funnels and **retention** follow real users; pair with
`reset()` on logout.

**Measurement ID (GA4)** — The `G-XXXXXXXX` id of a GA4 **Web data stream**, used
by **gtag** to *send* events. It's the "write" identifier — public, lives in the
browser tag. Don't confuse it with the numeric **Property ID** used to read data.

**Property ID (GA4)** — The numeric id of a GA4 property, used by the **Data API**
to *read* analytics back into your own dashboard. The "read" identifier — paired
with a service-account credential. Not interchangeable with the **Measurement
ID**.

**Retention** — A report measuring whether users come *back* over time after a
first action (day-1, day-7, day-30 return rates). The clearest signal of real,
durable value versus one-off visits. Usually sliced by **cohort**.

**RUM** — See **RUM (Real-User Monitoring)** under Core Web Vitals & performance;
the same field-data idea applies to performance analytics here.

**Sampling** — Computing a metric from a subset of events and extrapolating, to
keep large queries fast/cheap. It trades exactness for speed and can mislead on
small segments. GA4 may sample large date ranges; PostHog/HogQL generally returns
exact counts.

**Session replay** — A reconstructed, video-like playback of a real user's session
(with inputs masked). Invaluable for debugging confusing UX and rage-clicks that
aggregate metrics can't explain. A PostHog feature; mask sensitive fields with
`maskAllInputs`.
