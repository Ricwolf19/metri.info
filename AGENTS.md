<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Metri Web — agent guide

Public web companion to the Metri mobile app: open calculators + docs, optional accounts, and the
premium sync API the mobile app consumes. Overview, quick start, env vars and deploy live in
`README.md`; the sync protocol in `docs/sync.md`.

## Stack

- **Next.js 16** (App Router, React 19, Server Components) — `cookies()`/`headers()`/route `params`
  are async, always `await` them. **Bun** for installs/scripts (Vercel builds on Node).
- TypeScript strict · Tailwind v4 (CSS-first `@theme`) · Framer Motion · Iconoir via the
  `@/components/icons` barrel (never import `iconoir-react` directly).
- Drizzle + Neon (Postgres) + Better Auth power the optional account layer; bundled content
  (calculators, docs) renders without a DB.
- Analytics (PostHog, GA4, Vercel) and PWA are env-gated — off when keys are absent.

## Commands

```bash
bun run dev            # dev server (Turbopack)
bun run verify         # bun run ci — format + lint + typecheck + test + circular + build (CI gate)
bun run test           # vitest — unit + PGlite integration suites
bun run db:generate    # author migrations locally, commit them; Vercel migrates on deploy
bun run db:status      # applied vs pending migrations on the live DB (exits 1 on drift)
bun run admin:bootstrap
```

Never auto-generate migrations in CI — `db:generate` is manual/local, the SQL in `drizzle/` is
committed, `scripts/vercel-migrate.mjs` applies it on deploy.

## Invariants

- **Arrow functions everywhere** (ESLint-enforced). **Design tokens, never hex** (`ink-*`,
  `accent`, `lime-*`; `ink-950` stays constant). Tokens mirror the mobile app 1:1.
- **i18n**: flat dotted keys in `lib/i18n/{en,es}.ts`; `es.ts` must cover every `en.ts` key.
  `useT()` in client components, `getT()`/`getLocale()` from `lib/i18n/server` in Server Components.
- **State**: no Zustand/Redux — Server Components fetch directly; client state is URL params +
  Context providers.
- **SEO is server-first**: Metadata API, JSON-LD, file-based sitemap/robots/manifest, dynamic OG.
  `app/sitemap.ts` must stay statically cached (`"use cache"` + `cacheLife("max")`) — a per-request
  sitemap broke GSC ingestion. SEO/analytics playbooks live in the maintainer's private notes.
- **JSON-LD emits one `<script type="application/ld+json">` per node, never one array.** A bare
  array makes `JSON.parse(el.textContent)["@context"]` undefined, which is how page-scanning
  browser extensions crash on our pages (`components/seo/JsonLd.tsx` explains the escaping too).
- **`lib/calculations` is mirrored 1:1 in the mobile app** (`src/features/calculators/math`).
  Same rule as the sync contract: change one, change both, or the two apps quote different
  numbers for the same body. Only `lib/calculations/energy.test.ts` guards this side.
- **Entitlements**: gate with `can(plan, feature)` (`lib/entitlements.ts`), never
  `plan === "premium"`. `subscription` is the billing source of truth; `user.plan` is a denormalized
  cache the client can never write (`input: false`).
- **`saveCalculation` requires a session** — no anonymous rows in `calculation_log`; aggregate usage
  goes to PostHog, not the DB.
- **Admin** (`/admin`) is EN-only, chromeless, gated by `requireAdmin`.

## Premium sync (serves the mobile app)

Read `docs/sync.md` before touching `app/api/sync/*` or `lib/sync/*`. Load-bearing rules:

- `userId` always comes from the session, never the payload (cross-tenant guard).
- `plan` is re-read from the DB per call (30s in-memory cache in `guard.ts`;
  `invalidatePlanCache()` is called from the admin plan mutation).
- Every push body goes through `lib/sync/contract.ts` first. `SYNC_TABLES` mirrors the mobile
  repo's `tables.ts` — adding a table means editing both.
- **Never call `db.transaction()`** — the neon-http driver throws unconditionally. Use `db.batch()`
  (one non-interactive transaction). `serverUpdatedAt` is always `clock_timestamp()`, never
  `now()`/`defaultNow()`.
- LWW is strictly newer (`>`); pushes carry a `deviceId` stored as `origin` so pulls exclude a
  device's own writes. Tombstones are purged after 90 days by `/api/cron/purge-sync`
  (`CRON_SECRET`-guarded, daily via `vercel.json`).

## Auth & email

- Better Auth callbacks never throw: email delivery is log-and-continue (`auth.email.send-ok` /
  `send-failed` / `send-skipped` events in Vercel logs). "User never got the email" almost always
  means the from-address is still Resend's restricted `onboarding@resend.dev` — verify a domain and
  set `AUTH_FROM_EMAIL`.
- `AUTH_FROM_EMAIL` is the one sender for everything an account receives (verification, reset,
  release notices) — no per-feature from-address.
- Rate limits are hardcoded in `RATE_LIMITS` (`lib/auth/server.ts`) — edit + redeploy, don't turn
  them into env vars. `BETTER_AUTH_RATE_LIMIT_ENABLED=false` is the single env kill-switch.
- Map new Better Auth error codes in `authErrorMessage()` (`lib/auth/errors.ts`); never surface
  `res.error.message` raw (leaks English into the ES locale).

## Mobile app distribution

`appDistribution` in `lib/site.ts` drives the Download page (`development` | `beta` | `live`).
Contract with the mobile repo's release workflow (the pipeline itself lives there):

- Every release-please release `metri-v<version>` carries `metri-<version>.apk`,
  `metri-<version>.apk.sha256` and `release.json` =
  `{ version, tag, runtimeVersion, apk, sha256, sizeBytes }`. Asset names and the tag shape are
  load-bearing (`TAG_RE`/`buildRelease` in `lib/releases/github.ts` cross-check all of it).
- CI then calls `POST /api/releases/notify` (`Bearer RELEASE_WEBHOOK_SECRET`, body `{ tag }`; 503
  while the secret is unset). Only the tag is trusted — everything stored is re-read from GitHub.
  It upserts `app_release`, expires the `app-release` cache tag, and emails verified users with
  `user.release_emails` once. The audience is frozen to accounts created at or before
  `published_at`, sent in id order; `notify_cursor` (last accepted user id) is saved after each
  batch, so a replay resumes instead of re-mailing, and the key `release-<tag>-after-<cursor|start>`
  dedupes a batch Resend accepted before the cursor was saved. Batches are paced 600 ms apart (one
  retry on 429); the first failure stops the run. `notified_at` is stamped only when it finished.
- `getLatestRelease()` (`use cache`, tagged) = newest row by `published_at`, else GitHub's newest
  stable release with a `release.json`. It feeds `GET /api/latest-version` (public, CDN-cached)
  and the Download page, which links the VERSIONED `apkUrl` — never replaced under a download.
- The tagged release is the ONLY download source (the rolling `apk-beta` release is gone). With no
  release known the page links the GitHub releases list. Never `releases/latest/…`: release-please
  creates the release about an hour before CI attaches its APK.
- Release emails: on by default, one-click opt-out. Unsubscribe tokens are HMACs keyed off
  `BETTER_AUTH_SECRET` (`lib/releases/unsubscribe.ts`); rotating it dead-links old emails. A GET
  never unsubscribes (link scanners) — only the page's form or the RFC 8058 POST does. The mobile
  app reads/writes the flag as `releaseEmails` on `/api/profile`.

## Layout

```
app/            App Router routes (EN at root, ES under /es) + SEO files +
                api/{auth,sync,cron,profile,releases,latest-version}
components/     ui, icons (barrel), layout, marketing, calculators, docs, account, admin, auth, …
content/docs/   MDX knowledge base (en/es)
lib/            calculations (pure math) · calculators (registry/configs) · sync · auth · db ·
                i18n · seo · analytics · entitlements · releases (mobile release feed + emails)
drizzle/        committed migrations
docs/           sync.md (protocol, authoritative)
```
