# Advanced SEO playbook (Next.js App Router)

> This is the SEO standard for Metri and a template for future projects.
> Goal: rank for high-intent, competitive queries (e.g. `ffmi calculator`,
> `tdee calculator`) in **English and Spanish**, with excellent Core Web Vitals.

---

## 1. Philosophy — server-first SEO

Search engines index **HTML returned by the server**. Anything rendered only
after client-side JS is, at best, indexed unreliably. So the rule is:

> **If a component can be a Server Component, it is one.** Interactivity lives in
> small client "islands"; everything that matters for SEO (headings, copy,
> links, metadata, structured data) is server-rendered.

Concretely in this repo:

- Pages are **statically generated** (SSG) wherever possible — instant TTFB on
  the edge, fully-formed HTML for crawlers.
- A calculator is a tiny `"use client"` island inside an otherwise static page.
- The static page carries the H1, the explanatory content, the FAQ, breadcrumbs
  and JSON-LD — that is what ranks.

This single principle is why a content-rich calculator page outranks a bare
embedded widget.

---

## 2. Internationalization & routing

### The decision

- **English at the root**: `https://metri.info/tools/ffmi-calculator`
- **Spanish under `/es` with localized slugs**:
  `https://metri.info/es/herramientas/calculadora-ffmi`

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
canonical URLs to resolve absolute), title template (`%s · Metri`), default
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

E-E-A-T / YMYL: fitness + health calculators are "Your Money or Your Life"
content. Google demands trust signals to rank them: a real author, an About
page, **cited scientific sources**, a "last reviewed" date, and a medical
disclaimer. Build these in, don't bolt them on.

---

## 6. Dynamic Open Graph images

Use the file convention `opengraph-image.tsx` per route with `ImageResponse`
(Edge runtime). One template renders a branded 1200×630 card per calculator/
article (name + tagline + logo). Set `alt`, `size`, `contentType`. This makes
every shared link look intentional — a real CTR lever on social and in some
SERP features.

---

## 7. Programmatic calculator SEO (the money pages)

This is how we compete with omnicalculator/ffmicalculator.org.

**One page per calculator, the keyword as the slug.** Each page renders, as
static HTML:

1. **H1** = the keyword ("FFMI Calculator").
2. The **interactive calculator** (client island).
3. **"How it's calculated"** — the real formula, plainly explained.
4. **"How to interpret your result"** — ranges/categories.
5. **FAQ** (drives `FAQPage` rich results).
6. **Related** calculators + knowledge-base links (topical cluster).

~600–900 words of genuinely useful copy per page. Bilingual (EN + ES localized
slugs).

**Shareable result URLs**: inputs go in query params (`?w=80&h=180`) so results
are linkable, but those URLs are `robots: noindex` with a `canonical` back to the
clean slug — no thin/duplicate-content dilution.

**Slug map** (EN at root / ES localized):

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

---

## 8. Core Web Vitals

Rankings are influenced by field CWV. Targets:

| Metric | Target  | How we hit it                                                     |
| ------ | ------- | ----------------------------------------------------------------- |
| LCP    | < 2.5s  | SSG + edge, `next/font` (no layout shift), prioritized hero image |
| CLS    | < 0.1   | font `display: swap` + fallback metrics; fixed media dimensions   |
| INP    | < 200ms | tiny client islands; defer non-critical JS                        |
| TTFB   | < 600ms | static pages served from the edge/CDN                             |

Practical: `next/image` for all imagery, `next/font` (already wired: Spline Sans

- JetBrains Mono with CSS variables), lazy-load below-the-fold heavy components.

---

## 9. Measurement & analytics

What's wired in this repo:

- **Vercel Analytics** (`@vercel/analytics`) — privacy-friendly pageviews/events,
  no cookie banner needed, zero config on Vercel.
- **Vercel Speed Insights** (`@vercel/speed-insights`) — **real-user** Core Web
  Vitals (the field data Google actually uses). This is the SEO-relevant one.
- **Google Analytics 4** (`@next/third-parties` `GoogleAnalytics`) — gated on
  `NEXT_PUBLIC_GA_ID`. Off until you set the env var.

Set up GA4: analytics.google.com → create a property → add a **Web** data stream
for `metri.info` → copy the **Measurement ID** (`G-XXXXXXXXXX`) → set
`NEXT_PUBLIC_GA_ID` in Vercel env. That's it; the component loads gtag.

**Google Search Console** (do this first, it's the most important SEO tool):

- Add `metri.info` as a property; verify via DNS TXT (or the `verification.google`
  meta — supported by our root metadata).
- Submit `https://metri.info/sitemap.xml`.
- Watch: Performance (queries/impressions/CTR/position), Pages (index coverage),
  and the Rich Results / Enhancements reports for FAQ/Breadcrumb validity.

Optional future "metrics panel in the app": GA4 has a Data API and Search Console
has an API — a server route can pull both and render an internal dashboard.

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
- `hreflang` checkers; `site:metri.info` to watch indexation.
