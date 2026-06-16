# Metri — SEO & analytics documentation

Practical, reusable playbooks for **advanced SEO** and **analytics instrumentation** with Next.js (App Router), written against this project but designed to **standardize across other projects**.

**SEO playbook**

- 🇬🇧 **English** → [`advanced-seo.en.md`](./advanced-seo.en.md)
- 🇪🇸 **Español** → [`advanced-seo.es.md`](./advanced-seo.es.md)

**Analytics playbook** (PostHog · GA4 · Vercel · Search Console)

- 🇬🇧 **English** → [`analytics.en.md`](./analytics.en.md)
- 🇪🇸 **Español** → [`analytics.es.md`](./analytics.es.md)

**Glossary** (slug, YMYL, E-E-A-T, LCP/CLS/INP, JSON-LD types, HogQL, …)

- 🇬🇧 **English** → [`glossary.en.md`](./glossary.en.md)
- 🇪🇸 **Español** → [`glossary.es.md`](./glossary.es.md)

The playbooks are **project-agnostic** (reusable for any site). Each doc is kept
in sync across languages — if you change one, change the other.

## SEO playbook covers

1. Philosophy — server-first SEO
2. i18n routing (EN at root, ES at `/es` with localized slugs) + hreflang
3. Metadata strategy (static + dynamic)
4. File-based SEO assets — `sitemap.ts`, `robots.ts`, `manifest.ts`
5. Structured data (JSON-LD) by use case
6. Dynamic Open Graph images
7. **Programmatic SEO** — one page per target keyword/entity (the money pages)
8. Core Web Vitals
9. Measurement & analytics (Vercel, GA4, Search Console)
10. **Content & trust elements by page type** — what each page type needs
    (homepage, article, e-commerce, SaaS, YMYL tool, local business, multi-lang)
11. Pre-launch checklist + testing tools
12. **Concept reference** — each SEO concept: what / why / impact / code

## Analytics playbook covers

0. Mental model — product vs acquisition vs RUM vs search (nothing in your DB)
1. **PostHog** — events, identify, session replay, heatmaps, funnels, the
   `/ingest` reverse proxy, HogQL reads
2. **Google Analytics 4** — the Measurement-ID (write) vs Property-ID (read) split
   + Data API
3. Vercel Analytics & Speed Insights (real-user Core Web Vitals)
4. Google Search Console
5. Which tool answers which question · 6. Dashboard caching · 7. Setup checklist
