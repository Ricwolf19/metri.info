# Premium sync — how it works

The mobile app (`Ricwolf19/metri`) is offline-first: SQLite on the device is the
source of truth. Premium adds a **one-way-per-direction delta sync** that mirrors
training data through this server so a user's other devices can read it back.

This document is the contract between the two repos. The server owns the rules
below; the client implements them in `src/features/sync/`.

## The shape of it

```
  device A                    metri.info                    device B
  ────────                    ──────────                    ────────
  SQLite  ──push(changes)──▶  sync_row (jsonb)  ──pull()──▶  SQLite
          ◀────pull()───────                   ◀──push()───
```

There is **no relational mirror**. Every synced row lands in one table,
`sync_row`, keyed by `(userId, tableName, rowId)` with the row's contents as
opaque `jsonb`. The server never interprets that payload — it only stores and
returns it.

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
  what makes cross-tenant access impossible; do not add a user field to the wire
  format.
- **`plan` is re-read from the database** on every call, not taken from
  `session.user.plan` — that rides a 5-minute signed cookie cache, so a
  revoked subscription would keep syncing until it expired.
- **Table names are allow-listed** against `SYNC_TABLES` in `contract.ts`, which
  mirrors `src/features/sync/tables.ts` in the mobile repo. **Adding a synced
  table means editing both.**
- **Timestamps are clamped**, not just validated. A client clock reporting a
  far-future `updatedAt` would win Last-Write-Wins forever and freeze that row
  permanently. Anything beyond `now + 5min` is pulled back to now.
- **Duplicate `(table,id)` pairs in one batch are collapsed** to the newest
  timestamp. Postgres raises `ON CONFLICT DO UPDATE command cannot affect row a
  second time` when the same key appears twice in one statement, which would
  fail the whole chunk.
- **Limits** (`LIMITS` in `contract.ts`): 1000 items per push, 64 KB per row,
  500 rows per pull page.
- The whole push runs **in one transaction**, so a failure can't leave the
  client's watermark ahead of what actually landed. `serverUpdatedAt` is set
  with **`clock_timestamp()`, not `now()`** — `now()` returns the transaction
  start time, so a batch would stamp every row identically, and the pull cursor
  (`>` on that column) would then skip everything past the first page. Do not
  "simplify" this back to `now()` or `defaultNow()`.

## Endpoints

Both are `POST`, both premium-only, both return `401` unauthenticated /
`403` without the entitlement.

### `/api/sync/push`

```jsonc
// request
{ "changes":   [{ "table": "set_logs", "id": "…", "updatedAt": 1730000000000, "data": { … } }],
  "deletions": [{ "table": "set_logs", "id": "…", "deletedAt": 1730000000000 }] }

// response
{ "ok": true, "count": 12 }
```

Conflict resolution is **Last-Write-Wins on the client's `updatedAt`** — the
server keeps the incoming row only when `excluded.updated_at >= sync_row.updated_at`.

Errors: `400 bad_request` (with a `detail`), `413 payload_too_large`,
`500 sync_failed`.

### `/api/sync/pull`

```jsonc
// request
{ "since": "2026-07-28T22:10:00.000Z" }   // or null for a full read

// response
{ "rows": [{ "table": "…", "id": "…", "data": { … }, "deleted": false, "updatedAt": 1730000000000 }],
  "cursor": "2026-07-28T22:15:00.000Z",
  "hasMore": false }
```

The cursor is **server** time (`serverUpdatedAt`), not client time — it has to be
monotonic against a single clock. **`hasMore` must be honoured**: keep pulling
with the returned cursor until it clears, or a large history converges one page
at a time.

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

- Adding a column is safe: `applyRow` intersects the incoming keys against the
  live table (`PRAGMA table_info`), so a device running an older schema drops
  keys it doesn't know instead of throwing `no such column`.
- **Renaming or dropping a column is not.** Rows written before the change keep
  the old key in `jsonb` forever. There is no server-side migration path — the
  server can't interpret `data`. A rename needs a hand-written `jsonb` key
  rewrite against `sync_row` covering all history.
- Treat synced column names as a **public wire format**. Add, don't rename.

## Failure modes worth knowing

- **One unappliable row must not stop a page.** The client wraps each `applyRow`
  in its own try/catch; without it, a single bad row aborted the loop before the
  cursor was stored, so every later run re-fetched and re-failed the same page —
  a silent, permanent dead sync.
- **Secondary unique constraints.** `on conflict(id)` doesn't cover a table with
  another unique index (`training_days` is unique on `(user_id, date)`). Two
  devices can create the same logical row with different ids; the client clears
  the local squatter before inserting. Any new table with a secondary unique key
  must be added to `EXTRA_UNIQUE` in the client's `engine.ts`.
- **Sync failures are silent by design.** No toast, no retry queue. The ring
  around the avatar is the entire user-facing signal.

## Related

- Entitlements: gate with `can(plan, "sync")` (`lib/entitlements.ts`), never
  `plan === "premium"`.
- Client implementation and its watermarks: `AGENTS.md` in the mobile repo.
