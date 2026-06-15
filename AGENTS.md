<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# METRI Web — agent & contributor guide

Public web companion to the METRI mobile app (Expo). Same brand, same formulas,
same i18n philosophy — built for the web with Next.js 16.

## Stack

- **Next.js 16** (App Router, React 19, Server Components) — file-based routing.
  Note: `cookies()`/`headers()`/route `params` are async — always `await` them.
- **Bun** — package manager + TS script runner (`bun run scripts/*.ts`). Vercel
  builds on Node; Bun is for installs and scripts.
- **TypeScript (strict)** · **Tailwind CSS v4** (CSS-first `@theme`) · **Framer Motion**.
- **Drizzle ORM + Neon (Postgres)** + **Better Auth** power the optional account
  layer — bundled content (calculators, docs, exercises) renders without a DB.
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
  `robots.ts`/`manifest.ts`, dynamic OG via `opengraph-image`.

## Commands

```bash
bun install
bun run dev        # dev server (Turbopack)
bun run build      # production build
bun run verify     # format + lint + typecheck + circular-deps + build (CI gate)
bun run knip       # dead-code / unused-dependency check
```

## Layout

```
app/            App Router routes (EN at root, ES under /es) + SEO files
components/     ui (primitives), icons (barrel), layout, marketing, shared,
               docs, calculators, exercises, programs, contact, seo
content/docs/   MDX knowledge base (en/es)
lib/            i18n, theme, calculations, calculators, db, auth, errors, seo, og
public/brand/   mark + PWA icons copied from the mobile app
```
