# Premium sync — server side (API + storage)

This document covers the **web half** of metri's premium sync: the API
endpoints, the validation rules, the storage model and the guarantees this
server gives. The **mobile half** (when sync runs, how changes are gathered,
how pulled rows are applied to SQLite, what the avatar ring shows) lives in the
app repo:

> **Mobile companion doc:**
> [`Ricwolf19/metri` → `docs/sync.md`](https://github.com/Ricwolf19/metri/blob/main/docs/sync.md)

Start with the glossary if terms like *cursor* or *tombstone* are new — the
rest of the doc uses them freely.

## Glossary

| Term | Meaning here |
| --- | --- |
| **Delta sync** | Moving only what changed since the last time, instead of re-sending everything. Both directions of metri sync are deltas. |
| **Push** | The mobile app sending its local changes up to this server. |
| **Pull** | The mobile app asking this server for changes it hasn't seen yet. |
| **Cursor** | A bookmark the client keeps that means "I have everything up to this point". Ours is a timestamp: the pull request says *give me rows changed after `since`*, and the response includes the new bookmark. The client stores it and presents it on the next pull. Nothing is remembered server-side — the client carries its own position. |
| **Watermark** | Same bookmark idea, but for the push direction (client-side only): the highest local change-timestamp already sent. Detailed in the mobile doc. |
| **Tombstone** | A record that says "this row was deleted". You cannot sync a deletion by just deleting — the other device would never hear about it. So deletes are stored as rows with `deleted = true` and pushed like any other change. |
| **LWW (Last-Write-Wins)** | The conflict rule. When two devices edit the same row, the version with the newer client `updatedAt` wins. Simple, predictable, and enough for single-user fitness data. |
| **Upsert** | Insert-or-update in one statement (`ON CONFLICT DO UPDATE`). How every pushed row lands. |
| **Opaque payload** | The server stores each row's contents as `jsonb` it never reads or interprets. Only the envelope (user, table, id, timestamps, deleted) is meaningful server-side. |

## Technologies

| Piece | Role |
| --- | --- |
| Next.js route handlers (`app/api/sync/{push,pull}`) | The two endpoints. Plain `POST` + JSON. |
| Better Auth session | Identifies the caller. `userId` **always** comes from the session, never from the body. |
| Drizzle ORM over **`neon-http`** | Database access. One HTTP request per statement — cheap and serverless-friendly, but **no interactive transactions** (see "Neon driver constraint"). |
| Neon Postgres | Holds the mirror table `sync_row`. |
| Sentry + `event.error` | Both endpoints report failures before flattening them to a 500 — the client is silent by design, so an unreported error here is invisible on both sides. |

## The shape of it

```
  device A                    metri.info                    device B
  ────────                    ──────────                    ────────
  SQLite  ──push(changes)──▶  sync_row (jsonb)  ──pull()──▶  SQLite
          ◀────pull()───────                   ◀──push()───
```

There is **no relational mirror**. Every synced row lands in one table,
`sync_row` (`lib/db/schema.ts`), keyed by `(userId, tableName, rowId)`:

| Column | Meaning |
| --- | --- |
| `userId` | Owner. Part of the primary key; cascades on account deletion. |
| `tableName` | The mobile SQLite table this row belongs to. Allow-listed. |
| `rowId` | The row's id in that table. |
| `data` | The row's full contents as opaque `jsonb` (`null` for tombstones). |
| `deleted` | Tombstone flag. |
| `origin` | Random id of the device that wrote this version (null for legacy rows) — what lets the pull skip a device's own writes. |
| `updatedAt` | **Client** content-modified time — the LWW comparison key. |
| `serverUpdatedAt` | **Server** write time — the delta-pull cursor. Indexed with `userId`. |

**Retention:** the table holds the **latest state** of each row, not a history.
An update overwrites in place; a delete flips the same row to a tombstone and
nulls `data`. Growth is proportional to the user's data volume, not to time or
write count.

**Tombstone purge:** a daily Vercel Cron (`vercel.json` →
`/api/cron/purge-sync`, guarded by `CRON_SECRET`) deletes tombstones older
than **90 days** (`purgeTombstones` in `store.ts`). The window is a
correctness bound, not a tuning knob: a device that never pulled a tombstone
and stays offline longer than the window will keep the deleted row locally,
and a later edit there can push it back to life. Live rows are never purged.

**Why opaque:** the mobile schema changes far more often than this one. A
relational mirror would mean a coordinated migration in both repos for every
training-model change, and a deploy ordering problem on every release. The cost
is paid on the client instead (see "Schema drift" below).

## Rules the server enforces

All in `lib/sync/`:

| File | Responsibility |
| --- | --- |
| `contract.ts` | Validates and normalizes every push body. The trust boundary. |
| `guard.ts` | Session + live entitlement check for both endpoints. |
| `store.ts` | The actual upsert / delta read. |

- **`userId` always comes from the session**, never from the payload. This is
  what makes cross-tenant access impossible; do not add a user field to the
  wire format.
- **`plan` is re-read from the database**, not taken from `session.user.plan` —
  that rides a 5-minute signed cookie cache, so a revoked subscription would
  keep syncing until it expired. The read goes through a **30-second in-memory
  cache** (`guard.ts`): a sync cycle is up to ~21 requests in seconds, and each
  paid the same SELECT — the endpoint's dominant Neon query. Per-warm-instance
  only; `invalidatePlanCache(userId)` is called from the admin plan mutation.
- **Table names are allow-listed** against `SYNC_TABLES` in `contract.ts`,
  which mirrors `src/features/sync/tables.ts` in the mobile repo. **Adding a
  synced table means editing both.**
- **Timestamps are clamped**, not just validated. A client clock reporting a
  far-future `updatedAt` would win Last-Write-Wins forever and freeze that row
  permanently. Anything beyond `now + 5min` is pulled back to now.
- **Duplicate `(table,id)` pairs in one batch are collapsed** to the newest
  timestamp. Postgres raises `ON CONFLICT DO UPDATE command cannot affect row a
  second time` when the same key appears twice in one statement, which would
  fail the whole chunk.
- **Limits** (`LIMITS` in `contract.ts`): 1000 items per push, 64 KB per row,
  1000 rows per pull page.
- **Echo suppression.** The client sends a stable random `deviceId` with both
  endpoints; pushes store it as `origin`, and the pull excludes rows whose
  `origin` matches the caller (legacy null-origin rows are always served).
  Without it, every push came straight back to its author on the next pull —
  thousands of redundant rows per cycle.
- **LWW is strictly newer (`>`), not `>=`.** A push carrying the exact stored
  timestamp is an echo (a second device re-pushing rows it just pulled);
  accepting it re-stamped `serverUpdatedAt` and forced every other device to
  re-download the history. The tie a strict compare sacrifices — two devices
  editing the same row in the same millisecond — is not a real case here.

## Neon driver constraint — batches, not transactions

The Drizzle client is built on **`drizzle-orm/neon-http`**, and that driver
**throws unconditionally on `db.transaction()`** ("No transactions support in
neon-http driver"). This took every push down in production once `applyPush`
was wrapped in a transaction.

The replacement is **`db.batch([...])`**: all statements are sent in a single
HTTP request and Neon executes them inside **one non-interactive transaction**
— atomic commit/rollback, so a mid-batch failure can't leave some chunks
committed while the client's watermark advances past rows that never landed.
The difference from a real transaction: you cannot read results between
statements. `applyPush` doesn't need to, so the batch is a full replacement.

Two standing rules follow:

- **Never call `db.transaction()` anywhere in this repo** while the client is
  `neon-http`. Use `db.batch()` for multi-statement atomicity, or switch the
  whole client to `drizzle-orm/neon-serverless` (WebSocket) if interactive
  transactions ever become necessary.
- **`serverUpdatedAt` is set with `clock_timestamp()` on both the insert values
  and the conflict update — never `now()` / `defaultNow()`.** Inside the batch
  transaction `now()` is the transaction start time, so every row would share
  one value; the pull cursor is a strict `>` on that column, so a push bigger
  than one pull page would then skip everything past the first page,
  permanently. `clock_timestamp()` is evaluated per row, keeping the ordering
  total.

## Endpoints

Both are `POST`, both premium-only, both return `401` unauthenticated /
`403` without the entitlement.

### `/api/sync/push`

```jsonc
// request
{ "deviceId":  "f3a…",   // optional; stored as `origin` for echo suppression
  "changes":   [{ "table": "set_logs", "id": "…", "updatedAt": 1730000000000, "data": { … } }],
  "deletions": [{ "table": "set_logs", "id": "…", "deletedAt": 1730000000000 }] }

// response
{ "ok": true, "count": 12 }
```

Conflict resolution is **Last-Write-Wins on the client's `updatedAt`** — the
server keeps the incoming row only when it is strictly newer:
`excluded.updated_at > sync_row.updated_at`.

Errors: `400 bad_request` (with a `detail`), `413 payload_too_large`,
`500 sync_failed`.

### `/api/sync/pull`

```jsonc
// request
{ "since": "2026-07-28T22:10:00.000Z",    // or null for a full read
  "deviceId": "f3a…" }                     // optional; excludes this device's own writes

// response
{ "rows": [{ "table": "…", "id": "…", "data": { … }, "deleted": false, "updatedAt": 1730000000000 }],
  "cursor": "2026-07-28T22:15:00.000Z",
  "hasMore": false }
```

The cursor is **server** time (`serverUpdatedAt`), not client time — it has to
be monotonic against a single clock. **`hasMore` must be honoured**: keep
pulling with the returned cursor until it clears, or a large history converges
one page at a time.

Known bound: the column stores microseconds but the cursor is an ISO string
(milliseconds), so rows sharing a millisecond with the last row of a page get
re-sent on the next pull. Applying is idempotent, so that's harmless — but the
client also breaks out of its drain loop when the cursor doesn't advance, so a
full page inside one millisecond can't spin. Making this exact means a keyset
cursor of `(serverUpdatedAt, tableName, rowId)`, which is a wire-format change
in both repos.

## What is NOT synced, and why

| Excluded | Reason |
| --- | --- |
| `users` | The row carries `plan`. It is client-writable through this API, so syncing it would let a modified client grant itself Premium. `plan` flows the other way: `subscription` → `user.plan` → session → local cache. |
| `progress_photos` | The `uri`/`thumb_uri` are local file paths, meaningless on another device. Uploading the images themselves is out of scope for now — **say so in the UI**, since "cloud backup" implies otherwise. |
| `reminders` | `notification_ids` are OS-scoped handles from the scheduling device. |

## Schema drift — the sharp edge

Because the mirror is opaque, **the client's apply path is where compatibility
lives**, and old rows are never rewritten server-side.

- Adding a column is safe: the client intersects incoming keys against its live
  table, so an older device drops keys it doesn't know.
- **Renaming or dropping a column is not.** Rows written before the change keep
  the old key in `jsonb` forever. There is no server-side migration path — the
  server can't interpret `data`. A rename needs a hand-written `jsonb` key
  rewrite against `sync_row` covering all history.
- Treat synced column names as a **public wire format**. Add, don't rename.

## Failure modes worth knowing

- **Sync failures are silent on the device by design** — the avatar ring is the
  only user-facing signal. That is why both routes report to Sentry *before*
  flattening errors to `500 sync_failed`: an unreported error here is invisible
  on both sides.
- The client-side counterparts (per-row apply isolation, secondary unique
  indexes, cursor stall guard) are documented in the
  [mobile doc](https://github.com/Ricwolf19/metri/blob/main/docs/sync.md).

## Related

- Entitlements: gate with `can(plan, "sync")` (`lib/entitlements.ts`), never
  `plan === "premium"`.
- Mobile engine, watermark/cursor storage, UI states:
  [`Ricwolf19/metri` → `docs/sync.md`](https://github.com/Ricwolf19/metri/blob/main/docs/sync.md).
