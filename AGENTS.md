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
- **Drizzle ORM + Neon (Postgres)** and **Better Auth** land in Phase 5.
- **Lucide** icons via the `@/components/icons` barrel (names mirror mobile;
  brand icons like GitHub ship as local components).

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
bun run verify     # lint + typecheck — the pre-commit gate
```

## Layout

```
app/            App Router routes + root layout (fonts, providers, metadata)
components/     icons (barrel), layout (Header/Footer/toggles), marketing, shared
lib/            i18n, theme, animations, utils, (db/auth/calculations later)
public/brand/   logo + icons copied from the mobile app
```
