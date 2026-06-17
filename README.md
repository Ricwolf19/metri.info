<p align="center">
  <img src="./public/brand/metri-mark.svg" alt="Metri" width="96" height="96" />
</p>

<h1 align="center">Metri Web · metri.info</h1>

<p align="center">
  The open-source web companion to the
  <a href="https://github.com/Ricwolf19/metri">Metri</a> mobile fitness app.
  On the web, Metri <em>is</em> the product: a suite of free, no-account fitness
  calculators plus a bilingual, evidence-based knowledge base — with an optional
  account for saved history, favorites and sync.<br />
  Dark-first, bilingual (EN/ES), SEO-first, installable as a PWA.
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149eca?logo=react" />
  <img alt="Tailwind CSS v4" src="https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white" />
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-bef82b?labelColor=18181b" />
</p>

## What is Metri Web?

Metri Web is a fully functional fitness toolkit you can use right now — no
sign-up required. The 16 calculators and the knowledge base are bundled content
that renders without a database, so the core experience works offline and stays
fast. Create an optional account only if you want to **save** results, pin
favorites and sync across devices. It's free and open source.

## Features

- **16 free calculators** — 1RM, TDEE/BMR, macros, body fat, BMI, FFMI,
  hydration, barbell plates, ideal weight, calorie deficit, protein, lean body
  mass, heart-rate zones, waist-to-height, Wilks/DOTS and calories burned. Each
  supports metric/imperial units and a side-by-side **compare mode**. Inputs live
  in the URL, so every result is **shareable** as a link or QR code with a
  dynamic Open Graph share card. Commonly used ones carry a "Popular" marker.
- **Bilingual knowledge base** — ~20 MDX guides across 8 categories
  (getting-started, calculators, nutrition, training, recovery, supplements,
  progress, glossary) with search and a grouped, compact listing.
- **Optional accounts** — email + password or Google/GitHub sign-in (with
  account linking and password reset). Save calculation **history** (explicit
  save), pin **favorites** for calculators and docs, and manage your profile and
  settings. Anonymous usage is never stored in the database.
- **Installable PWA** — works offline, with offline-capable calculators, an
  offline fallback page and an install prompt.
- **Bilingual routing** — English at the root, Spanish under `/es` with
  localized slugs and reciprocal hreflang.
- **Advanced SEO** — server-first rendering, the Metadata API, JSON-LD,
  file-based sitemap/robots/manifest and dynamic OG images.
- **Admin dashboard** — a role-gated `/admin` area with in-app analytics drawn
  from Postgres and PostHog (mobile sync from the app is planned).

## Tech stack

| Layer                     | Choice                                              |
| ------------------------- | --------------------------------------------------- |
| Framework                 | Next.js 16 (App Router, React 19, Server Components) |
| Language                  | TypeScript (strict)                                 |
| Styling                   | Tailwind CSS v4 (CSS-first `@theme`)                |
| Animation                 | Framer Motion                                       |
| Icons                     | Iconoir (`@/components/icons` barrel)               |
| Content                   | MDX (`next-mdx-remote`)                              |
| Database                  | Drizzle ORM + Neon (Postgres) — _accounts only_     |
| Auth                      | Better Auth (email + password, Google/GitHub)       |
| Product analytics         | PostHog · GA4 · Vercel Analytics + Speed Insights   |
| Package manager / runner  | Bun                                                 |

The **calculators and docs are bundled static content** — they need no database
and render as static HTML. The DB + auth layer powers accounts, saved history and
favorites, and activates only when configured.

## Quick start

```bash
bun install
cp .env.example .env   # fill in DEV values (all optional for the static site)
bun run dev            # http://localhost:3000
```

The site runs fully without any environment variables; accounts, analytics and
the contact form activate only when their keys are present.

## Key scripts

| Script                    | What it does                                         |
| ------------------------- | ---------------------------------------------------- |
| `bun run dev`             | Dev server (Turbopack)                               |
| `bun run build`           | Production build                                     |
| `bun run verify`          | format + lint + typecheck + circular-deps + build (CI gate) |
| `bun run knip`            | Dead-code / unused-dependency check                  |
| `bun run db:generate`     | Generate Drizzle migrations from the schema (local)  |
| `bun run db:migrate`      | Apply pending migrations                             |
| `bun run db:studio`       | Open Drizzle Studio                                  |
| `bun run admin:bootstrap` | Create the first admin user                          |
| `bun run gen:favicons`    | Regenerate favicons/PWA icons                        |

## Environment variables

All configuration is optional — see [`.env.example`](./.env.example) for the full
list and inline docs. In short: `DATABASE_URL` + `BETTER_AUTH_SECRET` enable
accounts, OAuth pairs enable social sign-in, `RESEND_API_KEY` powers contact +
password-reset email, and the `*_POSTHOG_*` / `NEXT_PUBLIC_GA_ID` keys enable
analytics. Copy the file to `.env` and fill in only what you need.

## Documentation

Reusable, **project-agnostic** playbooks live in [`docs/seo/`](./docs/seo) (EN +
ES, kept in sync):

- [`advanced-seo`](./docs/seo/advanced-seo.en.md) — server-first SEO, i18n/
  hreflang, metadata, JSON-LD, OG images, Core Web Vitals, content & trust
  elements by page type, and a concept reference.
- [`analytics`](./docs/seo/analytics.en.md) — PostHog · GA4 · Vercel · Search
  Console, the `/ingest` reverse proxy, HogQL funnels, dashboard caching.
- [`glossary`](./docs/seo/glossary.en.md) — every technical term in one place.

## Deploying

Deploys on **Vercel**. Database migrations apply automatically during the build
via `scripts/vercel-migrate.mjs` (wired into the `vercel-build` script), so you
generate migrations locally with `db:generate`, commit them, and the deploy runs
`db:migrate` for you.

## License

Released under the [MIT License](./LICENSE) — © 2026 Ricardo Tapia. You're free
to use, modify and distribute it; just keep the copyright and license notice.
