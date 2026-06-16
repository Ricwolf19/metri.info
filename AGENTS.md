<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Metri Web — agent & contributor guide

Public web companion to the Metri mobile app (Expo). Same brand, same formulas,
same i18n philosophy — built for the web with Next.js 16.

## Stack

- **Next.js 16** (App Router, React 19, Server Components) — file-based routing.
  Note: `cookies()`/`headers()`/route `params` are async — always `await` them.
- **Bun** — package manager + TS script runner (`bun run scripts/*.ts`). Vercel
  builds on Node; Bun is for installs and scripts.
- **TypeScript (strict)** · **Tailwind CSS v4** (CSS-first `@theme`) · **Framer Motion**.
- **Drizzle ORM + Neon (Postgres)** + **Better Auth** power the optional account
  layer (email+password, Google/GitHub, account linking, password reset via
  Resend) — bundled content (calculators, docs) renders without a DB.
- **Analytics**: **PostHog** (autocapture, heatmaps, session replay), GA4, and
  Vercel Analytics + Speed Insights — all env-gated, off when keys are absent.
- **PWA**: installable + offline calculators via `public/sw.js`, `app/manifest.ts`
  and an offline fallback (`app/offline`).
- **Iconoir** icons via the `@/components/icons` barrel — each is wrapped to take a
  `size` (px) prop and re-exported under stable names that mirror mobile. Brand
  icons (GitHub) ship as local components. Never import `iconoir-react` directly.

## Conventions

- **Arrow functions everywhere** — enforced by ESLint (`func-style`,
  `react/function-component-definition`). No `function` declarations.
- **Design tokens, never hex.** Use `ink-*`, `accent`, `accent-fill`, `lime-*`.
  Tokens are ported 1:1 from the mobile app and swap per theme via CSS vars
  (`data-theme` on `<html>`). `ink-950` stays constant (dark text on lime).
- **i18n**: flat dotted keys in `lib/i18n/{en,es}.ts` (same as mobile). Use
  `useT()` in client components and `getT()`/`getLocale()` from
  `lib/i18n/server` in Server Components. `es.ts` must cover every `en.ts` key.
- **State**: no Zustand/Redux. Server Components fetch directly; client state is
  URL params + React Context (`ThemeProvider`, `I18nProvider`).
- **SEO**: server-first. Metadata API, JSON-LD, file-based `sitemap.ts`/
  `robots.ts`/`manifest.ts`, dynamic OG via `opengraph-image` + `app/og/calc`.
- **Calculation logging = explicit save only.** `saveCalculation` (`lib/calculators/log.ts`)
  requires a session and rejects anonymous saves — no null-userId rows ever land
  in `calculation_log`. Aggregate product usage is tracked via PostHog events,
  not the DB.
- **Admin** (`/admin`) is **EN-only**, chromeless (no marketing nav/footer) and
  driven by a sidebar (`components/admin/nav.ts`). It's role-gated by
  `requireAdmin` (`lib/auth/admin.ts`); create the first admin with
  `bun run admin:bootstrap`.
- **DB migration flow**: `db:generate` is run **manually/locally** against the
  schema, the generated SQL in `drizzle/` is committed, and Vercel applies it on
  deploy via `scripts/vercel-migrate.mjs` (`db:migrate`). Never auto-generate in
  CI.

## Commands

```bash
bun install
bun run dev        # dev server (Turbopack)
bun run build      # production build
bun run verify     # format + lint + typecheck + circular-deps + build (CI gate)
bun run knip       # dead-code / unused-dependency check

# Database (Drizzle) — generate locally, commit, Vercel migrates on deploy
bun run db:generate   # author migrations from the schema (manual/local)
bun run db:migrate    # apply migrations (also run by Vercel via vercel-migrate)
bun run db:studio     # Drizzle Studio

bun run admin:bootstrap  # create the first admin user
```

## Layout

```
app/            App Router routes (EN at root, ES under /es) + SEO files.
               Pages: tools/[calc], docs/[slug], account (+ settings),
               admin (+ analytics/users/calculations/services), sign-in/up,
               forgot/reset-password, offline, s/[id] (share), og/calc,
               api/auth/[...all]
components/     ui (primitives), icons (barrel), layout, marketing, shared,
               calculators, docs, account, admin, analytics, pwa, auth,
               contact, legal, seo
content/docs/   MDX knowledge base (en/es) — 8 categories
lib/
  calculations/   pure formulas, split: shared, strength, energy, body, cardio
  calculators/    config-driven registry + configs/ + content + share + log
  analytics/      posthog + db-metrics (admin dashboards)
  account/        profile providers + settings
  favorites/      pin/unpin server actions + useFavorites hook
  auth/           server (Better Auth) + client + admin (requireAdmin)
  admin/          admin data helpers
  db/             Drizzle schema + client
  i18n, theme, docs, contact, legal, seo, og
public/         brand mark + PWA icons, sw.js (service worker)
drizzle/        generated migrations (after db:generate)
docs/seo/       project-agnostic playbooks: advanced-seo, analytics
               (PostHog/GA4), glossary — EN + ES, kept in sync
```

## Reference docs

`docs/seo/` holds reusable, **project-agnostic** playbooks (each in EN + ES,
kept 1:1 in sync):

- **`advanced-seo.{en,es}.md`** — server-first SEO, i18n/hreflang, metadata,
  sitemap/robots, JSON-LD, OG images, programmatic SEO, Core Web Vitals,
  content & trust elements by page type (incl. YMYL), and a concept reference.
- **`analytics.{en,es}.md`** — PostHog vs GA4 vs Vercel vs Search Console, the
  `/ingest` reverse proxy, HogQL funnels, dashboard caching.
- **`glossary.{en,es}.md`** — slug, YMYL, E-E-A-T, JSON-LD types, CWV
  (LCP/CLS/INP/TTFB), HogQL, GA4 Measurement vs Property ID, etc.

When you touch SEO, analytics, or i18n routing, read the relevant playbook
first and keep it accurate.
