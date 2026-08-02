# Sitemaps & indexing — operational runbook

> Companion to [`advanced-seo.en.md`](./advanced-seo.en.md) (which covers how the
> assets are **built**). This doc is the **operations** side: what a sitemap is,
> how metri.info generates it, how to submit it to Google, and how to diagnose the
> Search Console errors you will actually hit. Project-specific, but the
> principles are reusable.

**Contents**

- [1. What a sitemap is (concept)](#1-what-a-sitemap-is-concept)
- [2. How metri.info generates it](#2-how-metriinfo-generates-it)
- [3. `lastModified` — what it is and how to set it right](#3-lastmodified--what-it-is-and-how-to-set-it-right)
- [4. Submitting to Google Search Console](#4-submitting-to-google-search-console)
- [5. Troubleshooting the GSC errors](#5-troubleshooting-the-gsc-errors)
- [6. Verification commands](#6-verification-commands)
- [7. Notes Google actually cares about](#7-notes-google-actually-cares-about)
- [8. Reading the URL Inspection tool & Page indexing report](#8-reading-the-url-inspection-tool--page-indexing-report)
- [9. Official references](#9-official-references)

---

## 1. What a sitemap is (concept)

A **sitemap** is a machine-readable list of the URLs on your site that you want
search engines to know about. It is **not** for users and it is **not** a menu —
it is a discovery hint for crawlers.

- **Format:** XML (the `sitemaps.org` schema). It is a `<urlset>` of `<url>`
  entries, each with a `<loc>` (the URL) and optional `<lastmod>`, `<changefreq>`,
  `<priority>`, and `<xhtml:link>` alternates for other languages.
- **What it does:** tells Google *which* URLs exist and *when they last changed*,
  so Google can find and re-crawl them efficiently. It is a **discovery aid**, not
  an indexing guarantee — Google still decides what to index.
- **What it is not:** it does not force indexing, does not boost ranking, and is
  not required for a small site (Google can crawl via links). It matters most for
  new sites, deep pages, and pages with few inbound links — exactly our case.
- **Two ways Google finds it:** (a) the `Sitemap:` line in `robots.txt`, and
  (b) an explicit submission in Search Console. We use both.

An HTML page (like the homepage) is **not** a sitemap. If you point Google at an
HTML page and call it a sitemap, it reports *"your sitemap appears to be an HTML
page"* — see [§5](#5-troubleshooting-the-gsc-errors).

## 2. How metri.info generates it

Everything is **file-based** via the Next.js App Router `MetadataRoute` API — no
plugin, no manual XML. Two files:

| File | Produces | Notes |
|------|----------|-------|
| `app/sitemap.ts` | `https://metri.info/sitemap.xml` | Next serves valid XML with `Content-Type: application/xml`. |
| `app/robots.ts` | `https://metri.info/robots.txt` | Allows `/`, disallows `/api/` and `/admin`, and points `Sitemap:` at the XML. |

`app/sitemap.ts` returns a `MetadataRoute.Sitemap` array. Each `entry()` also
emits **hreflang alternates** (`en` at root, `es` under `/es`) so Google pairs the
two language versions instead of treating them as duplicates:

```ts
alternates: { languages: { en: absoluteUrl(enPath), es: absoluteUrl(esPath) } }
```

It emits **one `<url>` per language version** (~94 today — every public page twice,
EN at root and ES under `/es`): home, tools hub, every calculator, docs,
download, and the legal pages. Auth/private pages (`sign-in`, `sign-up`, `admin`,
`forgot/reset-password`, `account`, share `/s/[id]`) are deliberately **kept out**
of the sitemap *and* marked `robots: { index: false }` in their page metadata — you
never want those indexed.

**Rule:** when you add a public route, add it to `app/sitemap.ts`. When you add a
private route, give its page `export const metadata = { robots: { index: false } }`.

## 3. `lastModified` — what it is and how to set it right

`<lastmod>` tells Google when a URL's content last changed, so it can prioritize
re-crawling what actually moved.

> **Implemented in this repo:** doc URLs now emit a real `<lastmod>` — the
> article's own `updatedAt` frontmatter when present, else `DOC_LAST_REVIEWED`
> (`lib/docs/sources.ts`). Static/tool/legal pages keep the build/deploy time.
> To give one article a precise date, add `updatedAt: "YYYY-MM-DD"` to its MDX
> frontmatter. The reference below explains the trade-offs.

**Original problem (before the fix):** `app/sitemap.ts` stamped **every** URL with
`lastModified: now` (the build/render time):

```ts
const now = new Date();
// ...every entry gets `now`
```

That means all 45 URLs always report "changed today." Google's guidance is that it
**uses `<lastmod>` only when it's consistently accurate**, and ignores it otherwise
— so today this signal is simply wasted (not harmful, just useless). This is
**polish, not the cause of any indexing failure.**

To make it useful, give each URL its **real** last-change date. Two approaches:

### Option A — frontmatter date (recommended, deterministic)

Add an `updatedAt` to each doc's MDX frontmatter and read it in the sitemap:

```md
---
title: "Evidence-based supplements"
updatedAt: "2026-06-16"
---
```

```ts
// app/sitemap.ts — docs
const docEntries = getDocSlugs("en").map((slug) => {
  const { updatedAt } = getDocMeta(slug, "en"); // expose updatedAt from lib/docs
  return entry(`/docs/${slug}`, `/es/docs/${slug}`, 0.6, "monthly", updatedAt ?? now);
});
```

Pros: explicit, no build-environment dependency. Cons: you bump it by hand when you
revise an article (acceptable — that is exactly when lastmod should change).

### Option B — git commit date (automatic)

Derive the date from the file's last commit at build time:

```ts
import { execSync } from "node:child_process";

const gitLastModified = (file: string): Date => {
  try {
    const iso = execSync(`git log -1 --format=%cI -- ${file}`, { encoding: "utf8" }).trim();
    return iso ? new Date(iso) : new Date();
  } catch {
    return new Date();
  }
};
```

Pros: zero maintenance, always accurate. Cons: needs git history at build time —
Vercel does a shallow clone by default, so a single-file `git log` usually works,
but verify it after the first deploy (fall back to `now` if it returns empty, as
above).

### Static / tool / legal pages

These have no per-page content date. Use a **single deploy date constant** (the
build time is fine, since they change together on deploys) rather than a per-URL
"now". If you prefer accuracy, apply Option B to their `page.tsx` source paths.

**Recommendation:** Option A for docs (the content that actually changes),
deploy-date for the rest. Or leave `now` if you don't want the maintenance — since
Google ignores an always-"now" lastmod, it costs nothing either way.

## 4. Submitting to Google Search Console

1. Search Console → property `metri.info` → **Sitemaps**.
2. In **"Add a new sitemap"**, type only the path: `sitemap.xml`. GSC prepends the
   domain → `https://metri.info/sitemap.xml`. **Submit.**
3. Do **not** submit the bare domain (`https://metri.info`) — GSC rejects it with
   *"Invalid sitemap address"* (it is not a sitemap file, it is a page).
4. Because `robots.txt` already contains `Sitemap: https://metri.info/sitemap.xml`,
   Google will also discover it on its own — the explicit submission just speeds it
   up.

Then, independent of the sitemap, **accelerate indexing** for the pages you care
about: **URL Inspection → enter the URL → Request Indexing.** Do this for the
homepage and 2-3 key pages (`/tools`, a top calculator). This triggers a crawl
directly and does not depend on the sitemap status.

## 5. Troubleshooting the GSC errors

### "Your sitemap appears to be an HTML page" / "El sitemap es HTML"

**Cause:** you submitted a URL that returns HTML instead of the XML file — almost
always the **homepage** (`https://metri.info/`) instead of `.../sitemap.xml`. GSC
fetched the page, saw `<html>` on line 1, and gave up (0 pages discovered).

**Fix:** remove that entry and submit `sitemap.xml` (see [§4](#4-submitting-to-google-search-console)).
The site itself is fine — this is a submission mistake.

### "Couldn't fetch" / "No se ha podido obtener/leer" (Type: Unknown)

**Cause (most common):** you *just* submitted it. GSC very frequently shows
"Couldn't fetch" / "Unknown" type for the first hours-to-days after submission,
then reads it successfully on the next crawl. "Última lectura = today" is the tell.

**Before worrying, rule out a real fetch problem** with [§6](#6-verification-commands):
the file must return `200` + `application/xml`, be valid XML, and be reachable by
Googlebot's user-agent (no WAF/bot-challenge). For metri.info all of these pass
(200, `application/xml`, ~94 URLs, Googlebot UA gets clean XML, served from
Vercel), so the correct action is:

- **Wait 24-48 h and re-check.** Do not resubmit repeatedly — it does not help and
  can reset the clock.
- Confirm you can open it via **"Open sitemap"** (it will load the XML).
- If after ~48 h it still says "Couldn't fetch", remove and re-add the sitemap
  **once**, then wait again.

**Observed on metri.info (day 1, July 2026):** submitted 28 Jul, still "Couldn't
fetch" with no last-read date and 0 pages discovered on 29 Jul — while every check
in [§6](#6-verification-commands) passed and the homepage got itself crawled and
indexed independently that same day. That combination (file provably fine + crawl
provably working + Sitemaps tab red) is exactly the known lag, not a fetch problem.
Requesting indexing on a page does **not** make GSC re-read the sitemap — they are
separate pipelines; the Sitemaps tab only updates when Google's sitemap processor
gets to it.

**Other real causes to check** (not our case, but for the runbook): the URL 404s;
a redirect chain (http→https, trailing-slash loop); the endpoint returned a 5xx at
the moment Google fetched (transient deploy); or bot protection (Cloudflare/Vercel
challenge) serving Googlebot a challenge page instead of XML.

## 6. Verification commands

Run these to prove the file is valid and reachable — the ground truth GSC lags
behind:

```bash
# Status + content-type (must be 200 + application/xml)
curl -sSL -o /dev/null -w "HTTP %{http_code} | %{content_type}\n" https://metri.info/sitemap.xml

# First lines must be XML, not <html>
curl -sSL https://metri.info/sitemap.xml | head -3

# Reachable by Googlebot's user-agent (rules out bot-blocking)
curl -sSL -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  -o /dev/null -w "HTTP %{http_code} | %{content_type}\n" https://metri.info/sitemap.xml

# Count URLs (sanity: matches app/sitemap.ts)
curl -sSL https://metri.info/sitemap.xml | grep -c "<loc>"

# robots.txt points to the sitemap and does not block public pages
curl -sSL https://metri.info/robots.txt
```

Also validate the XML with Google's own tools: the **URL Inspection** tool on
`https://metri.info/sitemap.xml`, or any sitemap validator.

## 7. Notes Google actually cares about

- **`<changefreq>` and `<priority>` are essentially ignored** by Google. Keep them
  or drop them; they do not affect crawling. `<lastmod>` is the only hint that can
  matter — and only if accurate (see [§3](#3-lastmodified--what-it-is-and-how-to-set-it-right)).
- **Consistency of URLs.** The sitemap `<loc>`, the page's `<link rel="canonical">`,
  the `hreflang` alternates, and `robots.txt` `Host:` must all use the same origin
  and form. Minor nit today: home is `https://metri.info/` (trailing slash) in the
  sitemap but `https://metri.info` (no slash) in the canonical — Google normalizes
  this, but aligning them is cleaner.
- **New site = slow indexing.** A young domain takes weeks-to-months to index
  regardless of the sitemap. The sitemap + `Request Indexing` speed discovery; they
  do not override Google's ranking/quality evaluation.
- **Check the Pages report, not just the Sitemaps tab.** GSC → *Page indexing*
  tells you if URLs are *Discovered – not indexed* or *Crawled – not indexed*
  (a content/quality/crawl-budget question) versus actually indexed. That is where
  you learn whether the pages are landing, once the sitemap reads successfully.

## 8. Reading the URL Inspection tool & Page indexing report

What the statuses in GSC's two inspection surfaces actually mean, per the official
docs ([§9](#9-official-references)). Knowing these saves a lot of false alarms.

### The two verdicts are different tools

- **"URL is on Google"** (indexed inspection) — the URL is in the index and
  *eligible* to appear in results. Google's own wording: it "is not guaranteed to
  be there."
- **"URL is available to Google"** (live test) — the page is fetchable, not
  blocked, no detectable indexing error *right now*. Explicitly **not** a promise
  of indexing: *"The live URL test only confirms if Google-InspectionTool can
  access your page for indexing."* Indexing additionally requires no manual/legal
  actions, being the selected canonical, and sufficient page quality.

### Live-test fields that look like errors but aren't

- **"Google-selected canonical: Information available after indexing"** — normal.
  Canonical selection happens at indexing time; the live test cannot know it.
- **"Detection: info not checked in live tests"** — the live test deliberately
  skips sitemap inclusion, referring pages, canonical selection and
  duplicate-status. Only the indexed inspection reports those.
- **"No referring sitemap detected"** on an indexed URL — can mean the sitemap
  hasn't been processed yet, but Google also documents it as a known bug: *"In a
  few cases, we don't report the sitemap for a page that was submitted in a
  sitemap. We are working to fix this."* Don't debug the sitemap off this field
  alone.
- **Spammy "referring pages"** (SEO-scraper domains linking a new site) — noise
  every new domain gets; it does not affect whether Google indexes you.

### Request indexing — what it actually buys

- Queues a crawl; *"indexing typically takes only a day or so, but can take much
  longer in some cases"* (the report doc says starting to crawl a new site can
  take *"a week or so"*, full coverage *"up to a few weeks"*).
- **No guarantee** of indexing, daily quota per property, and repeating the
  request does not move you up the queue. Re-request only after the page changed
  substantially.
- For anything more than a handful of URLs, the sitemap **is** the bulk-submission
  mechanism.

### Page indexing report — the states that matter

- **Discovered – currently not indexed:** Google knows the URL, hasn't crawled it
  yet (often deliberate pacing on new/small sites). No action; it retries alone.
- **Crawled – currently not indexed:** Google fetched it and chose not to index —
  a content/quality signal, the one worth acting on if it persists.
- Filter **All known pages** vs **All submitted pages** to see sitemap-submitted
  URLs vs everything Google found by itself.
- Expectations, straight from the doc: *"Google doesn't guarantee that all pages
  everywhere will make it into the Google index"* and only canonical pages get
  indexed. Sites under ~500 pages "probably don't need to use this report" daily.

## 9. Official references

- **URL Inspection tool** — verdict meanings, live test vs indexed inspection,
  request-indexing limits:
  <https://support.google.com/webmasters/answer/9012289>
- **Page indexing report** — not-indexed states, sitemap filters, indexing
  timelines:
  <https://support.google.com/webmasters/answer/7440203>
