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
- TypeScript strict · Tailwind v4 (CSS-first `@theme`) · `motion` (LazyMotion + `m`, loaded only
  inside `MotionProvider` surfaces: landing, download, account) + CSS keyframes ·
  `@number-flow/react` for rolling numbers · Iconoir via the `@/components/icons` barrel (never
  import `iconoir-react` directly).
- Drizzle + Neon (Postgres) + Better Auth power the optional account layer; bundled content
  (calculators, docs) renders without a DB.
- Analytics (PostHog, GA4, Vercel) and PWA are env-gated — off when keys are absent.

## Commands

```bash
bun run dev            # dev server (Turbopack)
bun run verify         # bun run ci — format + lint + typecheck + test + circular + build (CI gate)
bun run test           # vitest — unit + PGlite integration suites
bun run test:browsers  # Playwright: every public page × Chromium, Firefox, WebKit, Pixel 7, iPhone 14
bun run db:generate    # author migrations locally, commit them; Vercel migrates on deploy
bun run db:status      # applied vs pending migrations on the live DB (exits 1 on drift)
bun run admin:bootstrap
```

Never auto-generate migrations in CI — `db:generate` is manual/local, the SQL in `drizzle/` is
committed, `scripts/vercel-migrate.mjs` applies it on deploy.

`test:browsers` builds and serves production on port 3100 with dummy env (no real DB, analytics,
Sentry upload or auth rate limit) and checks each page in EN and ES: loads, throws nothing, logs no
error, fits the screen. `--project=webkit` runs one browser; `bunx playwright install` once first.
It is not part of `verify`. Playwright's WebKit is close to Safari but not Safari, so check
critical flows on a real iPhone before a release.

## Invariants

- **Arrow functions everywhere** (ESLint-enforced). **Design tokens, never hex** (`ink-*`,
  `accent`, `lime-*`; `ink-950` stays constant). Tokens mirror the mobile app 1:1.
- **Dark only.** There is no light scheme, no theme toggle and no `data-theme` attribute —
  `:root` in `globals.css` is the palette; never add `dark:`/`light:` variants.
- **Animation**: hero copy and anything above the fold stay CSS-only (`animate-rise`); the hero's
  only script is the decorative `HeroField` canvas (2D, self-contained in one effect so it restarts
  after React `<Activity>` hides a route — never WebGL). Below-the-fold reveals use
  `Reveal` from `components/motion` inside a `MotionProvider`; never import `motion`
  (the full component) — `LazyMotion` is `strict`. One side navigation: `components/ui/SideNav.tsx`
  (docs, account). Section pages open with `components/shared/PageHero.tsx`. Glows behind
  centred objects use `.glow-orb` (fades on every side); `.glow-brand` is top-anchored and shows a
  hard edge if its box starts inside the viewport. Every loading state is `LoadingScreen` (the mobile
  `AppLoader` port: the mark breathing inside a lime arc, always centred); there are no grey
  skeleton blocks anywhere.
- **Type**: Geist Sans for everything meant to be read — headings, paragraphs, buttons, form
  labels. JetBrains Mono (`font-mono`) is the machine voice — nav links, kickers/eyebrows, section
  numbers, numeric values, badges, tab labels, hashes. Never set a paragraph or a button in mono.
- **Landing** (`components/marketing/Home.tsx`) is five beats and no more: hero, the two link strips
  (`Marquees`), the app tour, the web half (`WebPreview`, calculators + docs in one section) and
  plans with the ownership strip. Don't add a section; extend one.
- **i18n**: flat dotted keys in `lib/i18n/{en,es}.ts`; `es.ts` must cover every `en.ts` key.
  `useT()` in client components; Server Components receive `locale` from the page and use
  `createT(locale)` from `lib/i18n/config`.
- **State**: no Zustand/Redux — Server Components fetch directly; client state is URL params +
  Context providers.
- **SEO is server-first**: Metadata API, JSON-LD, file-based sitemap/robots/manifest, dynamic OG.
  `app/sitemap.ts` must stay statically cached (`"use cache"` + `cacheLife("max")`) — a per-request
  sitemap broke GSC ingestion. SEO/analytics playbooks live in the maintainer's private notes.
  Two rules the page HTML depends on, both guarded by `e2e/smoke.spec.ts`: an indexable page's
  `generateMetadata` never reads `searchParams` (dynamic metadata is streamed after the HTML to
  crawlers that run JS, Googlebot included, so the title and canonical go missing; shared quiz
  results live on `/quiz/result` for that reason, see `lib/quiz/metadata.ts`), and a Suspense
  around `useSearchParams` renders the real content as its fallback (`DocsIndex`), or the
  prerendered HTML ships without it.
- **JSON-LD emits one `<script type="application/ld+json">` per node, never one array.** A bare
  array makes `JSON.parse(el.textContent)["@context"]` undefined, which is how page-scanning
  browser extensions crash on our pages (`components/seo/JsonLd.tsx` explains the escaping too).
- **Body & training map** (`/account/body`, `components/body`, `lib/sync/body.ts`): the app's
  Metrics tab read-only from the sync mirror, Premium only. `lib/training/{muscles,muscle-load}.ts`
  and `lib/training/catalog.ts` mirror the app's muscle model and seeded exercise catalog (only
  custom exercises sync, so the catalog is what attributes a logged set to muscles); `lib/body/
  {sites,weekly,map}.ts` mirror the tape sites, the weekly-average math and the map's colours;
  `lib/body/figure.ts` is the figure's SVG path data (from `react-native-body-highlighter`, MIT,
  the library the app draws with), server-only and passed down as a prop. Share cards go through
  `/og/body?c=<token>` (numbers only, `lib/body/share.ts`); exports stream from
  `/account/body/export` as CSV or a dependency-free `.xlsx` (`lib/exports/xlsx.ts`), and "PDF"
  is the browser's print under the `@media print` rules in `globals.css`.
- **Horizontal scrollers** wrap in `components/ui/ScrollHint.tsx` (the side nav's phone row, data
  tables, the admin heatmaps): a fade plus a nudging chevron on whichever edge still has content.
- **`lib/calculations` is mirrored 1:1 in the mobile app** (`src/features/calculators/math`).
  Same rule as the sync contract: change one, change both, or the two apps quote different
  numbers for the same body. `lib/calculations/{energy,strength}.test.ts` guard this side. The
  plate calculator's racks (`PLATE_SETS`, kg and lb) come from the app's training `plate-math.ts`.
- **Knowledge check** (`lib/quiz`): `areas.ts` and the first sixteen questions of `content.ts` came
  from the app's former `src/features/quiz` (area ids and `REVEAL_MS` are still shared contracts;
  the web is the quiz's home now). The engine is a full diagnostic: every (area, level) cell is asked
  twice with two different questions (thirty-two in all, `QUIZ_LENGTH`), level by level with the
  areas rotated and the option order shuffled per attempt; a level counts only when both answers
  are right. Results keep the app's `Record<QuizArea, 0..4>` shape and add every miss: the
  browser's localStorage for everyone, `quiz_attempt` for any signed-in account (`can(plan,
  "history")` is the one switch if that ever narrows). It recommends guides, it never locks one.
  Writing rule, held by `content.test.ts`: the right answer must not be the longest option more
  often than chance, and never by a wide margin.
- **Calculator inputs**: a field a formula ignores declares `usedWhen` (`lib/calculators/types.ts`;
  TDEE body fat is Katch-McArdle only, Navy hip is women only) and renders disabled with its reason,
  never as an error. Share / Save / Compare sit at the top of the calculator with fixed-width labels
  (`StableLabel`), so nothing above the inputs moves while they change. Signed-in prefill is
  `PREFILL` (field → fact, `lib/calculators/prefill.ts`) over `buildCalcFacts` (`facts.ts`): a
  synced reading beats the profile, the profile beats the user's last saved calculation, and a fact
  only lands if the field accepts it.
- **Forms** use react-hook-form: Save stays disabled until `isDirty`, a successful save calls
  `reset(values)` so the same values are never written twice, `isSubmitting` is the only pending
  flag, and server errors go through `setError` (`root.server` for the form, the field otherwise).
  Live calculators are not forms: their state is the URL.
- **Roadmap** (`/roadmap`, `lib/roadmap`): a ten-question diagnostic → `recommend()` (phase, pace,
  block length from the `choosing-your-phase` tables: body fat sets the direction, experience the
  pace, a long diet earns a maintenance block first) → ordered steps in four stages, each linking a
  guide or calculator. Steps are ticked by hand or by `Evidence` the account shows (saved calcs,
  quiz attempts, synced weigh-ins and tape). A visitor's plan lives in localStorage; an account's
  only in the `roadmap` row (a shared browser never hands one person's plan to the next), and a
  visitor's plan moves to the account once at sign-in. A failed read is never treated as "no
  plan", or the next save would overwrite it. `parseRoadmap` guards both stores; answers, step ids
  and phases are a stored format, so add values, never rename them. Guides a step links must exist in both
  locales (`ROADMAP_DOCS`).
- **Entitlements**: gate with `can(plan, feature)` (`lib/entitlements.ts`), never
  `plan === "premium"`. `subscription` is the billing source of truth; `user.plan` is a denormalized
  cache the client can never write (`input: false`).
- **`saveCalculation` requires a session** — no anonymous rows in `calculation_log`; aggregate usage
  goes to PostHog, not the DB.
- **Admin** (`/admin`) is EN-only and gated by `requireAdmin`. The overview opens with one number
  per upstream (Postgres, PostHog, Sentry, GA4) so a missing key shows there, then first-party
  series, the PostHog traffic calendar and weekday/hour heatmaps (`components/admin/charts`, plain
  SVG, no chart package) and the top lists; every card degrades on its own. Drilldowns are the
  analytics tabs (see Admin analytics below). It has no sidebar: the site header
  swaps its sections for `ADMIN_NAV_GROUPS` on admin paths (`isAdminPath`), and the footer and
  launcher stay off (`isChromelessPath`). Admin grids always declare `grid-cols-1` below their
  breakpoint and `Card` is `min-w-0`: an implicit `auto` column grows to its widest child (the
  hour heatmap, a truncated Sentry title) and pushes the whole page past a phone's edge.
- **Lists** (admin users, admin calculations, account history) are `listkit`: a config built with
  `defineListConfig` from `listkit/server` in `lib/lists/*`, a `"use server"` fetcher that runs
  `executeSqlList` (`listkit/sql`) on `lib/lists/pool.ts` with a filter-id → column whitelist, a
  page that seeds the first query with `loadInitialList`, and a client `NextListView`. Filter ids in
  the config ARE the keys of the SQL whitelist. Brand theme/tones live in `lib/lists/theme.ts`;
  `<html class="dark">` is what switches listkit to its dark variants. Never pass Drizzle objects
  to listkit; it speaks text SQL with `$n` params through the pool.

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
  release notices, monthly emails) — no per-feature from-address (`lib/emails/sender.ts`).
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
- The Download button and QR point at `/download/apk` (`app/download/apk/route.ts`), which streams
  the versioned GitHub asset with `Content-Type: application/vnd.android.package-archive`, a
  filename and Range passthrough. GitHub serves `application/octet-stream`, and Android's download
  manager stalls at 100% / never offers to install on that type. Never link the GitHub asset URL
  directly from a phone-facing control; keep it as the checksum reference only.
- The release email has ONE button, to the download page, never the APK: email apps open links
  in an embedded WebView where a file download silently does nothing. `DownloadButtons` spots
  that WebView (`; wv)` in the user agent) and offers "Open in Chrome" (an `intent://` link) and
  copy-link instead of a button that can't work. The notes render with `links: false` (no GitHub
  link anywhere in the email) and `versionHeading: false` (the heading already names the version).
- `proxy.ts` (locale detection) only ever redirects a `GET` document navigation: Server Action
  POSTs, RSC fetches and prefetches pass through untouched, or the client receives HTML where it
  expects a Flight payload ("An unexpected response was received from the server").
- Release emails: on by default, one-click opt-out. Unsubscribe tokens are HMACs keyed off
  `BETTER_AUTH_SECRET` (`lib/emails/unsubscribe.ts`); rotating it dead-links old emails. A GET
  never unsubscribes (link scanners) — only the page's form or the RFC 8058 POST does. The mobile
  app reads/writes the flag as `releaseEmails` on `/api/profile`.

## Monthly email

`/api/cron/monthly-report` (`CRON_SECRET`, `0 15 2-4 * *`) emails the month that just ended to
verified accounts with `user.monthly_report_emails = true`. Code lives in `lib/reports`.

- **Opt-in**, because it carries body data: `null` = never answered, and `MonthlyReportPrompt`
  asks once on `/account` and `/account/body`; either answer is stored. The switch lives under
  Notifications. Unsubscribe tokens are scoped per list (`EmailList` in
  `lib/emails/unsubscribe.ts`), so a monthly link can never turn off release emails.
- **Never an empty report.** Premium with enough data (`hasEnoughData`: 4+ sessions, 4+ weigh-ins
  or 14+ food days) gets the report: the email shows the verdict, changes only (never absolute
  body numbers), up to two observations and the next step, with the full PDF attached. Everyone
  else gets the tips edition (`tips.ts`): three rotating tips, a recommendation built from saved
  calculations and the knowledge check, and the latest app version. A Premium account that's
  short on data waits for the day-4 run in case the phone syncs late.
- `monthly.ts` is pure and rule-based on the mirrored `muscle-load`/`weekly` helpers; thresholds
  are constants at its top. Sessions and sets count on the device-local day from
  `training_days`. Observations are worded as observations, not medical advice. Every tip
  restates a guide, and `tips.test.ts` checks each linked guide exists in both languages.
- The PDF is `@react-pdf/renderer` (`pdf.tsx`, same dark tokens as the emails). Its Geist TTFs
  are read from `node_modules/geist` at runtime and pinned by `outputFileTracingIncludes`.
- One `emails.send` per person, because Resend's batch endpoint takes no attachments. Sends are
  paced 600 ms apart, with a 270 s budget, and three failures in a row stop the run. The
  `monthly_report` (user, period) row plus the idempotency key `monthly-<period>-<user>` make any
  rerun safe; a failed person is retried on the next day's run. Preview everything (both
  editions and the PDF) with `bun run email:preview`.

## Admin analytics

`/admin/analytics` is one tab per source, all over the same date window: Behavior (PostHog,
`lib/analytics/behavior.ts`), Heatmaps (PostHog, `heatmaps.ts` + `heatmap-queries.ts` + `heat.ts`),
Traffic (GA4, `ga.ts`), Search (Search Console, `search.ts` + `search-console.ts`) and Errors
(Sentry, `errors.ts` + `sentry.ts`). Panels live in `components/admin/analytics`.

- **The window** is `lib/analytics/range.ts`: `?range=7d|30d|90d|365d` or `?from=&to=`, inclusive
  days on `ANALYTICS_TIME_ZONE` (the operator's clock). A page awaits `searchParams`, calls
  `readAnalyticsRequest` (it reads the clock, so never before), renders `RangeBar`, and wraps the
  panel in a Suspense keyed by `windowKey` so a new range shows the loader, not stale numbers.
  Sources with less history clamp and say so (heatmaps 90 days, Sentry 90, Search Console ends 3
  days back on final data).
- **Every card is a `SourceCard`**: not configured → which keys to set; `null` → the source didn't
  answer; empty → nothing in the range. Readers keep that contract: null only on failure, `[]` for
  an answer with no rows. Each tab opens with `SourceNotice`: one connect card when its source is
  off (and nothing else), a banner when it's simulated.
- **Simulated mode** (`lib/analytics/simulate.ts`): on `next dev` without a source's keys, every
  reader of that source answers with seeded made-up data in the live shapes, and every card and
  pulse says "Simulated". `sourceMode()` is the one switch; `simulating()` only ever returns true
  when `NODE_ENV === "development"`, so a deployed or test build never invents a number. Values are
  seeded per metric and day, so ranges agree with each other and totals match their trends. A new
  reader gets a simulator next to the others, checked first (`if (simulated()) return sim…`).
- **HogQL never holds request data.** Windows, types, viewport bounds and URL patterns go in
  `runHogQL`'s `values` as `{name}`; only code constants are inlined (`lit`). Instants are bound in
  UTC with a trailing `Z`. `behavior.test.ts` checks it. PostHog runs at most three queries at once
  (`createLimiter`), and `createApiClient` retries a 429 once.
- **Heatmaps** read PostHog's `heatmaps` table in HogQL (the `query:read` key, no extra scope): x as
  a share of the viewport width, y in CSS px, devices filtered on the stored `viewport_width` (CSS
  px / 16). Capture needs `enable_heatmaps` and `capture_dead_clicks` in `PostHogProvider`, cookie
  consent, and heatmaps switched on in the PostHog project settings. The preview is a same-origin
  iframe of the live English page in the admin's own session, scaled, with the heat drawn on a
  canvas over it (`components/admin/heatmaps`). Two things keep it honest: a framed page reads
  consent as declined (`readConsent`), so the preview never tracks the admin or shows the banner;
  and nothing may send `X-Frame-Options: DENY` or `frame-ancestors 'none'` for public pages
  (`SAMEORIGIN` / `'self'` is fine), or the preview falls back to a blank sheet.
- **Search Console** uses the GA4 service account (`GA4_CREDENTIALS_JSON`, added as a user on the
  property) and `GSC_SITE_URL`. It caches with `use cache: remote`, never `fetch`'s data cache: the
  hourly access token is part of a fetch cache key, which would re-inspect every sitemap URL each
  hour. Index coverage runs URL Inspection on every sitemap URL, once a day per URL (quota 2,000 a
  day per property), five at a time; a failure throws inside the cache scope so it is never cached.
- **GA4** goes through the gRPC SDK, so its reads cache with `use cache` + `cacheTag(metrics.ga)`.
  **Sentry** counts `outcome=accepted` error events and filters org endpoints by numeric project id.

## Layout

```
app/            App Router routes (EN at root, ES under /es) + SEO files +
                api/{auth,sync,cron,profile,releases,latest-version}
components/     ui, icons (barrel), layout, marketing, calculators, docs, account, admin, auth, …
content/docs/   MDX knowledge base (en/es)
lib/            calculations (pure math) · calculators (registry/configs) · sync · auth · db ·
                i18n · seo · analytics · entitlements · releases (mobile release feed + emails) ·
                reports (monthly email + PDF)
e2e/            Playwright cross-browser smoke (`bun run test:browsers`)
drizzle/        committed migrations
docs/           sync.md (protocol, authoritative)
```
