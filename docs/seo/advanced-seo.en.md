# Advanced SEO playbook (Next.js App Router)

> A reusable, project-agnostic SEO playbook for the Next.js App Router.
> Goal: rank for high-intent, competitive queries (in any niche) across
> **multiple languages**, with excellent Core Web Vitals.

**Contents**

- [1. Philosophy — server-first SEO](#1-philosophy--server-first-seo)
- [2. Internationalization & routing](#2-internationalization--routing)
- [3. Metadata strategy](#3-metadata-strategy)
- [4. File-based SEO assets](#4-file-based-seo-assets)
- [5. Structured data (JSON-LD)](#5-structured-data-json-ld)
- [6. Dynamic Open Graph images](#6-dynamic-open-graph-images)
- [7. Programmatic SEO (the money pages)](#7-programmatic-seo-the-money-pages)
- [8. Core Web Vitals](#8-core-web-vitals)
- [9. Measurement & analytics](#9-measurement--analytics)
- [Content & trust elements by page type](#content--trust-elements-by-page-type)
- [10. Pre-launch checklist](#10-pre-launch-checklist)
- [11. Concept reference — what / why / impact / code](#11-concept-reference--what--why--impact--code)
- [12. Further reading — authoritative sources](#12-further-reading--authoritative-sources)

---

## 1. Philosophy — server-first SEO

Search engines index **HTML returned by the server**. Anything rendered only
after client-side JS is, at best, indexed unreliably. So the rule is:

> **If a component can be a Server Component, it is one.** Interactivity lives in
> small client "islands"; everything that matters for SEO (headings, copy,
> links, metadata, structured data) is server-rendered.

Concretely:

- Pages are **statically generated** (SSG) wherever possible — instant TTFB on
  the edge, fully-formed HTML for crawlers.
- Any interactive widget is a tiny `"use client"` island inside an otherwise
  static page. A calculator is one example; the same pattern applies to a
  product configurator, a booking form, a map, a pricing slider — anything that
  needs the browser.
- The static page carries the H1, the explanatory content, the FAQ, breadcrumbs
  and JSON-LD — that is what ranks.

This single principle is why a content-rich page outranks a bare embedded
widget.

---

## 2. Internationalization & routing

### The decision

- **English at the root**: `https://example.com/tools/ffmi-calculator`
- **Spanish under `/es` with localized slugs**:
  `https://example.com/es/herramientas/calculadora-ffmi`

Why localized slugs (not `/es/tools/ffmi-calculator`)? Spanish SERPs reward the
keyword in the URL: real competitors rank `…/salud/calculadora-ffmi` and
`…/calculadora/ffmi`. The keyword-in-path is a ranking and CTR signal.

### Implementation

Two explicit route trees that **share components**:

```
app/(site)/tools/ffmi-calculator/page.tsx          → EN
app/es/herramientas/calculadora-ffmi/page.tsx      → ES
```

Each page is a thin wrapper that renders the same shared component with a
`locale` prop and locale-specific content. No dynamic `[locale]` segment is
needed because the path segments themselves differ per language — and this keeps
every page **fully static and middleware-free**.

A single **route map** (`lib/i18n/routes.ts`) is the source of truth pairing each
page's EN and ES URLs. It drives: the language switcher, `hreflang` alternates,
and the sitemap. Never hardcode the sibling-language URL in a page.

### hreflang (critical)

Every page declares reciprocal alternates + `x-default`:

```ts
export const metadata = {
  alternates: {
    canonical: "/tools/ffmi-calculator",
    languages: {
      en: "/tools/ffmi-calculator",
      es: "/es/herramientas/calculadora-ffmi",
      "x-default": "/tools/ffmi-calculator",
    },
  },
};
```

Rules: alternates must be **reciprocal** (ES page points back to EN), use real
language codes (`en`, `es`), and always include `x-default`.

---

## 3. Metadata strategy

### Static (root `app/layout.tsx`)

Set once, inherited by all pages: `metadataBase` (required for relative OG/
canonical URLs to resolve absolute), title template (`%s · Brand`), default
description, Open Graph, Twitter card, robots, `appleWebApp`, `category`.

### Dynamic (per page)

Use `generateMetadata` for any page whose title/description/canonical varies:

```ts
export const generateMetadata = async ({ params }): Promise<Metadata> => {
  const calc = getCalculator(params.slug);
  return {
    title: calc.seoTitle, // "FFMI Calculator — Fat-Free Mass Index"
    description: calc.seoDescription,
    alternates: { canonical: calc.path, languages: calc.alternates },
    openGraph: {
      title: calc.seoTitle,
      images: [`${calc.path}/opengraph-image`],
    },
  };
};
```

### Resolution order

Deeper segments override shallower ones; objects are **merged**, not deep-merged
field by field — so re-declare nested fields you want to keep. `title.template`
from the root applies to child `title` strings automatically.

### Anti-patterns

- ❌ Titles > ~60 chars or descriptions > ~160 chars (truncated in SERPs).
- ❌ Relative OG image URLs without `metadataBase`.
- ❌ `noindex` accidentally left on a production page.
- ❌ Duplicate titles across calculator pages.

---

## 4. File-based SEO assets

Next App Router generates these from TypeScript files:

- **`app/sitemap.ts`** → `/sitemap.xml`. Generated from the route map +
  content sources (docs, exercises). Each URL gets `lastModified`,
  `changeFrequency`, `priority`, and **per-URL `alternates.languages`** for
  hreflang. Calculators get the highest priority (0.9–1.0).
- **`app/robots.ts`** → `/robots.txt`. Allow everything indexable, disallow
  `/api/`, internal/auth paths, and `?`-param result URLs; point to the sitemap.
- **`app/manifest.ts`** → `/manifest.webmanifest`. PWA name, icons, theme color.

---

## 5. Structured data (JSON-LD)

Emit JSON-LD server-side via a `<script type="application/ld+json">` (a small
`<JsonLd>` component). Match the type to the page:

| Page              | Schema                                                                |
| ----------------- | --------------------------------------------------------------------- |
| Homepage          | `Organization` + `WebSite` (with `SearchAction` sitelinks searchbox)  |
| Calculator        | `SoftwareApplication`/`WebApplication` + `FAQPage` + `BreadcrumbList` |
| Health calculator | also `MedicalWebPage` + cited sources (YMYL trust)                    |
| Doc article       | `Article` (or `MedicalWebPage`) + `BreadcrumbList`                    |
| Any deep page     | `BreadcrumbList`                                                      |

`FAQPage` is the highest-leverage one for calculators — it wins extra SERP space.
**Only mark up content that is actually visible on the page**, or it's a
violation.

E-E-A-T / YMYL: pages that can affect a person's health, finances or safety
(health/fitness calculators, financial tools, legal/medical advice) are "Your
Money or Your Life" content. Google demands trust signals to rank them: a real
named author/reviewer, an About page, **cited authoritative sources**, a "last
reviewed" date, and a disclaimer. Build these in, don't bolt them on.

---

## 6. Dynamic Open Graph images

Use the file convention `opengraph-image.tsx` per route with `ImageResponse`
(Edge runtime). One template renders a branded 1200×630 card per calculator/
article (name + tagline + logo). Set `alt`, `size`, `contentType`. This makes
every shared link look intentional — a real CTR lever on social and in some
SERP features.

---

## 7. Programmatic SEO (the money pages)

The pattern: generate one focused page per target keyword, with the keyword as
the slug, from a single template fed by structured data. This is how you compete
at scale for a family of related queries — whatever the niche.

**One page per entity, the keyword as the slug.** Each page renders, as
static HTML:

1. **H1** = the keyword.
2. The **interactive widget** (client island) — the calculator, configurator,
   booking form, etc.
3. **"How it works"** — the real method/formula, plainly explained.
4. **"How to interpret your result"** — ranges/categories/next steps.
5. **FAQ** (drives `FAQPage` rich results).
6. **Related** pages + knowledge-base links (topical cluster).

~600–900 words of genuinely useful copy per page. Multilingual (e.g. EN + ES
localized slugs).

**Shareable result URLs**: inputs go in query params (`?w=80&h=180`) so results
are linkable, but those URLs are `robots: noindex` with a `canonical` back to the
clean slug — no thin/duplicate-content dilution.

**Example: a site of calculators** (EN at root / ES localized). The same
slug-map approach works for product pages, locations, or any other entity set:

| Calculator         | EN                               | ES                                            |
| ------------------ | -------------------------------- | --------------------------------------------- |
| FFMI               | `/tools/ffmi-calculator`         | `/es/herramientas/calculadora-ffmi`           |
| 1RM                | `/tools/1rm-calculator`          | `/es/herramientas/calculadora-1rm`            |
| TDEE/BMR           | `/tools/tdee-calculator`         | `/es/herramientas/calculadora-tdee`           |
| Macros             | `/tools/macro-calculator`        | `/es/herramientas/calculadora-macros`         |
| Body fat           | `/tools/body-fat-calculator`     | `/es/herramientas/calculadora-grasa-corporal` |
| BMI / ideal weight | `/tools/bmi-calculator`          | `/es/herramientas/calculadora-imc`            |
| Hydration          | `/tools/water-intake-calculator` | `/es/herramientas/calculadora-agua`           |
| Plates             | `/tools/plate-calculator`        | `/es/herramientas/calculadora-discos`         |

(Competing against incumbents like the big calculator aggregators is a matter of
better content depth + trust signals + Core Web Vitals on each of these pages.)

---

## 8. Core Web Vitals

Rankings are influenced by field CWV. Targets:

| Metric | Target  | How we hit it                                                     |
| ------ | ------- | ----------------------------------------------------------------- |
| LCP    | < 2.5s  | SSG + edge, `next/font` (no layout shift), prioritized hero image |
| CLS    | < 0.1   | font `display: swap` + fallback metrics; fixed media dimensions   |
| INP    | < 200ms | tiny client islands; defer non-critical JS                        |
| TTFB   | < 600ms | static pages served from the edge/CDN                             |

Practical: `next/image` for all imagery, `next/font` for self-hosted fonts with
CSS variables (no layout shift), lazy-load below-the-fold heavy components.

---

## 9. Measurement & analytics

A typical wiring:

- **Vercel Analytics** (`@vercel/analytics`) — privacy-friendly pageviews/events,
  no cookie banner needed, zero config on Vercel.
- **Vercel Speed Insights** (`@vercel/speed-insights`) — **real-user** Core Web
  Vitals (the field data Google actually uses). This is the SEO-relevant one.
- **Google Analytics 4** (`@next/third-parties` `GoogleAnalytics`) — gated on
  `NEXT_PUBLIC_GA_ID`. Off until you set the env var.

Set up GA4: analytics.google.com → create a property → add a **Web** data stream
for `your-domain.com` → copy the **Measurement ID** (`G-XXXXXXXXXX`) → set
`NEXT_PUBLIC_GA_ID` in your hosting env. That's it; the component loads gtag.

**Google Search Console** (do this first, it's the most important SEO tool):

- Add `your-domain.com` as a property; verify via DNS TXT (or the
  `verification.google` meta — supported by the root metadata).
- Submit `https://your-domain.com/sitemap.xml`.
- Watch: Performance (queries/impressions/CTR/position), Pages (index coverage),
  and the Rich Results / Enhancements reports for FAQ/Breadcrumb validity.

Optional "metrics panel in the app": GA4 has a Data API and Search Console
has an API — a server route can pull both and render an internal dashboard.

> **Going deeper:** product analytics (PostHog), GA4's read/write split, the
> `/ingest` reverse proxy, HogQL funnels and dashboard caching have their own
> project-agnostic guide → [`analytics.en.md`](./analytics.en.md).

---

## Content & trust elements by page type

Different page types rank on different signals. Match the content, structured
data and trust elements to what the page is _for_:

| Page type                      | H1 / heading structure                                          | FAQ?         | Author / citations / last-reviewed / disclaimer (YMYL) | Best-fit JSON-LD                                                  | hreflang note                                         |
| ------------------------------ | -------------------------------------------------------------- | ------------ | ------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------- |
| Homepage                       | Brand/value H1, then H2 per major section                      | Optional     | No                                                     | `Organization` + `WebSite` (+ `SearchAction`)                    | `x-default` → primary language home                   |
| Blog / Article                 | Headline as H1, H2/H3 outline of the argument                  | Optional     | Author byline + dates; citations if factual            | `Article` (or `NewsArticle`/`BlogPosting`) + `BreadcrumbList`    | Translate slug; reciprocal alternates per article     |
| Product / E-commerce           | Product name H1, H2 for specs/reviews                          | Often (Q\&A) | Reviews/ratings, not author                             | `Product` (+ `Offer`, `AggregateRating`) + `BreadcrumbList`      | Per-locale price/currency; alternates per product     |
| SaaS / landing                 | Outcome-focused H1, H2 per feature/benefit                     | Recommended  | Optional; testimonials build trust                      | `SoftwareApplication` + `FAQPage` + `BreadcrumbList`             | Localized landing per market                          |
| Health/finance (YMYL) tool/calc | Keyword H1, H2 for method + interpretation + FAQ              | **Yes**      | **Required** (named reviewer, sources, date, disclaimer) | `SoftwareApplication`/`WebApplication` + `MedicalWebPage` + `FAQPage` + `BreadcrumbList` | Localized slug; reciprocal alternates                 |
| Local service business         | "{Service} in {City}" H1, H2 for services/areas/reviews        | **Yes**      | Reviews + NAP, not academic citations                   | `LocalBusiness` (+ `Service`, `AggregateRating`) + `FAQPage`     | One page per city/locale; alternates if multilingual  |
| Multi-language site            | Same outline per language; never mix languages on one URL      | Mirror EN/ES | Mirror per language                                     | Same type per locale, translated values                          | **Reciprocal `hreflang` + `x-default` on every page** |

YMYL pages (health, finance, legal) **require** a named author/reviewer, cited
authoritative sources, a last-reviewed date, and a disclaimer to rank at all —
trust is the gate, not a bonus. Informational and local pages instead lean on
**NAP** (name, address, phone), a `LocalBusiness` profile, and genuine reviews;
a fumigation/pest-control company, for example, ranks on consistent NAP, service
areas, and star ratings far more than on academic citations.

---

## 10. Pre-launch checklist

- [ ] `metadataBase` set; every page has a unique title + description.
- [ ] Canonical on every page; `?param` result URLs are `noindex` + canonicaled.
- [ ] hreflang reciprocal (en ↔ es) + `x-default` on every translated page.
- [ ] `sitemap.xml` includes all calculators/docs with hreflang; `robots.txt` ok.
- [ ] JSON-LD valid (Organization, per-calculator SoftwareApplication + FAQ +
      Breadcrumb). Validated in Rich Results Test.
- [ ] OG image renders for every page type.
- [ ] Lighthouse ≥ 95 (Perf/SEO/Best Practices/A11y) on key pages.
- [ ] Semantic HTML: one `<h1>`, logical heading order, `<nav>/<main>/<footer>`,
      alt text, keyboard nav.
- [ ] Search Console verified + sitemap submitted.
- [ ] Analytics receiving data (Vercel + GA4 if enabled).

## Testing tools

- Google **Rich Results Test** (JSON-LD), **URL Inspection** (Search Console).
- **PageSpeed Insights** / Lighthouse (CWV, lab + field).
- **Schema Markup Validator** (schema.org).
- `hreflang` checkers; `site:your-domain.com` to watch indexation.

---

## 11. Concept reference — what / why / impact / code

Each concept in one place: **what** it is, **what** it gives you, **what** it
affects, and the minimal correct **code**. Project-agnostic.

### Canonical URL

- **What:** the one "official" URL for a piece of content.
- **Gives:** consolidates duplicates (params, `www`/trailing-slash variants).
- **Affects:** prevents duplicate-content dilution; concentrates ranking signals.

```ts
export const metadata = { alternates: { canonical: "/tools/ffmi-calculator" } };
```

### hreflang + x-default

- **What:** declares the language/region variants of a page.
- **Gives:** Google serves the right language; avoids EN/ES competing.
- **Affects:** international ranking + CTR. Must be **reciprocal**.

```ts
alternates: {
  canonical: "/tools/ffmi-calculator",
  languages: {
    en: "/tools/ffmi-calculator",
    es: "/es/herramientas/calculadora-ffmi",
    "x-default": "/tools/ffmi-calculator",
  },
}
```

### metadataBase

- **What:** the absolute base URL for resolving relative metadata.
- **Gives:** correct absolute OG/canonical URLs.
- **Affects:** broken social previews if missing.

```ts
export const metadata = { metadataBase: new URL("https://example.com") };
```

### Title & description

- **What:** the SERP headline + snippet.
- **Gives:** keyword relevance + click-through.
- **Affects:** ranking (title) and CTR (both). Keep ≤ ~60 / ~160 chars; unique.

```ts
export const metadata = {
  title: { default: "Example", template: "%s · Example" },
  description: "One clear sentence with the primary keyword.",
};
```

### robots / noindex

- **What:** indexing directives per page.
- **Gives:** keeps thin/duplicate/param URLs out of the index.
- **Affects:** index hygiene; an accidental `noindex` in prod tanks traffic.

```ts
// a shareable ?param result page — don't index, canonical to the clean slug:
export const metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/tools/ffmi-calculator" },
};
```

### Sitemap & robots.txt

- **What:** machine list of indexable URLs + crawl rules.
- **Gives:** faster, complete discovery; per-URL hreflang.
- **Affects:** crawl coverage and freshness.

```ts
// app/sitemap.ts
export default function sitemap() {
  return ROUTES.map((r) => ({
    url: abs(r.en),
    lastModified: new Date(),
    alternates: { languages: { en: abs(r.en), es: abs(r.es) } },
    priority: r.isCalculator ? 0.9 : 0.6,
  }));
}
```

### Structured data (JSON-LD)

- **What:** machine-readable description of the page (schema.org).
- **Gives:** rich results (FAQ, breadcrumbs, ratings) — more SERP real estate.
- **Affects:** CTR strongly; only mark up **visible** content.

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a } })),
}) }} />
```

### Open Graph image

- **What:** the preview card when a link is shared.
- **Gives:** intentional, branded social/SERP previews.
- **Affects:** CTR on social and some SERP features.

```tsx
// app/tools/[calc]/opengraph-image.tsx
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() { return new ImageResponse(<Card/>, size); }
```

### Semantic HTML & headings

- **What:** one `<h1>`, ordered headings, `<nav>/<main>/<footer>`, alt text.
- **Gives:** clear document structure for crawlers + a11y.
- **Affects:** comprehension, accessibility score, featured-snippet eligibility.

### Internal linking / topical clusters

- **What:** related pages link to each other around a topic.
- **Gives:** spreads link equity; signals topical authority.
- **Affects:** ranking of the whole cluster, not just one page.

### Server-first rendering (SSG/RSC)

- **What:** ship complete HTML from the server; JS only for small islands.
- **Gives:** reliable indexing + fast TTFB/LCP.
- **Affects:** both indexing quality and Core Web Vitals.

### Core Web Vitals

- **What:** LCP < 2.5s, CLS < 0.1, INP < 200ms (field data).
- **Gives:** better UX and a ranking signal.
- **Affects:** ranking (tie-breaker) and bounce. Measure with Speed Insights.

> For the analytics that measure all of the above, see
> [`analytics.en.md`](./analytics.en.md).

---

## 12. Further reading — authoritative sources

Keep these bookmarked; they are the **canonical, always-current** references.
When SEO advice conflicts, these win.

- **[Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)**
  — Google's official fundamentals: how Search discovers, crawls and ranks
  pages, and the practices Google itself recommends. The "is my site doing the
  basics right?" reference. (Part of **Google Search Central**, the full
  developer SEO documentation.)
- **[Search Console — Performance report](https://search.google.com/search-console/performance/)**
  — your site's **real** search data: the queries you appear for, impressions,
  clicks, CTR and average position. This is the empirical feedback loop — it
  tells you which keywords actually rank, instead of guessing.
- **[schema.org](https://schema.org)** — the vocabulary for structured data:
  every type and property you can put in JSON-LD (`Article`, `FAQPage`,
  `BreadcrumbList`, `MedicalWebPage`, `Product`, `LocalBusiness`, …). The
  dictionary behind section 5. Pair it with Google's **Rich Results Test** to
  validate.
- **[Search Quality Rater Guidelines (PDF)](https://services.google.com/fh/files/misc/hsw-sqrg.pdf)**
  — the manual Google's human quality raters use. It defines **E-E-A-T**
  (Experience, Expertise, Authoritativeness, Trust), **YMYL** (Your Money or
  Your Life), "Page Quality" and "Needs Met". The authoritative explanation of
  what Google means by "quality" — essential for health/finance/legal pages.

Supporting references already used throughout this guide: **web.dev** (Core Web
Vitals), **MDN** (semantic HTML), and the **PageSpeed Insights** / **Rich
Results Test** tools in section "Testing tools".
