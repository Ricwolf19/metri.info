import "server-only";

import { and, asc, eq, gt, isNull, lt, ne, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { syncRow } from "@/lib/db/schema";
import { LIMITS, type PushDeletion, type PushRow } from "@/lib/sync/contract";

/**
 * Server side of the premium delta sync: opaque JSON rows keyed by
 * (user, table, row), LWW writes on the client's `updatedAt` (epoch ms), delta
 * reads by `serverUpdatedAt`. `userId` is always the session's, never the
 * payload's; everything else goes through `lib/sync/contract` first.
 *
 * @see docs/sync.md for the protocol and its invariants.
 */

const CHUNK = 200;

export const applyPush = async (
  userId: string,
  rows: PushRow[],
  deletions: PushDeletion[],
  origin: string | null,
): Promise<void> => {
  // `clock_timestamp()` (per-row), never `now()`/`defaultNow()` (one value for
  // the whole batch transaction): identical stamps would let the strict-`>`
  // pull cursor skip past a page and drop the tail permanently.
  // See docs/sync.md → "Neon driver constraint".
  const serverNow = sql`clock_timestamp()`;
  const values = [
    ...rows.map((r) => ({
      userId,
      tableName: r.table,
      rowId: r.id,
      data: r.data as unknown,
      deleted: false,
      origin,
      updatedAt: new Date(r.updatedAt),
      serverUpdatedAt: serverNow,
    })),
    ...deletions.map((d) => ({
      userId,
      tableName: d.table,
      rowId: d.id,
      data: null,
      deleted: true,
      origin,
      updatedAt: new Date(d.deletedAt),
      serverUpdatedAt: serverNow,
    })),
  ];
  if (!values.length) return;

  // One `db.batch` = one non-interactive transaction (neon-http throws on
  // `db.transaction`): a mid-batch failure can't leave chunks committed while
  // the client's watermark advances past rows that never landed.
  const statements = [];
  for (let i = 0; i < values.length; i += CHUNK) {
    statements.push(
      db
        .insert(syncRow)
        .values(values.slice(i, i + CHUNK))
        .onConflictDoUpdate({
          target: [syncRow.userId, syncRow.tableName, syncRow.rowId],
          set: {
            data: sql`excluded.data`,
            deleted: sql`excluded.deleted`,
            origin: sql`excluded.origin`,
            updatedAt: sql`excluded.updated_at`,
            serverUpdatedAt: sql`clock_timestamp()`,
          },
          // LWW, strictly newer (`>`): an equal timestamp is an echo, and
          // accepting it would re-stamp `serverUpdatedAt` and force every
          // other device to re-download history. `contract.ts` clamps future
          // timestamps. See docs/sync.md → "Rules the server enforces".
          setWhere: sql`excluded.updated_at > ${syncRow.updatedAt}`,
        }),
    );
  }
  await db.batch(
    statements as [
      (typeof statements)[number],
      ...(typeof statements)[number][],
    ],
  );
};

export type PullResult = {
  rows: {
    table: string;
    id: string;
    data: unknown;
    deleted: boolean;
    updatedAt: number;
  }[];
  cursor: string | null;
  /** True when the page was capped — the client should pull again with the new
   * cursor until it clears. */
  hasMore: boolean;
};

/** One page of this user's rows changed after `since` (ISO server time),
 * oldest-first. `deviceId` excludes the caller's own writes (echo
 * suppression); legacy rows with a null `origin` are always served. */
export const pullSince = async (
  userId: string,
  since: string | null,
  deviceId: string | null,
): Promise<PullResult> => {
  const notOwnEcho = deviceId
    ? or(isNull(syncRow.origin), ne(syncRow.origin, deviceId))
    : undefined;
  const where = and(
    eq(syncRow.userId, userId),
    since ? gt(syncRow.serverUpdatedAt, new Date(since)) : undefined,
    notOwnEcho,
  );

  // Tie-broken ordering so pages can't interleave nondeterministically even if
  // two rows ever land on the same microsecond.
  const rows = await db
    .select()
    .from(syncRow)
    .where(where)
    .orderBy(
      asc(syncRow.serverUpdatedAt),
      asc(syncRow.tableName),
      asc(syncRow.rowId),
    )
    .limit(LIMITS.pullPage);

  const cursor = rows.length
    ? rows[rows.length - 1].serverUpdatedAt.toISOString()
    : since;

  return {
    rows: rows.map((r) => ({
      table: r.tableName,
      id: r.rowId,
      data: r.data,
      deleted: r.deleted,
      updatedAt: r.updatedAt.getTime(),
    })),
    cursor,
    hasMore: rows.length === LIMITS.pullPage,
  };
};

/** Correctness bound, not a tuning knob: a device offline longer than this
 * never hears the deletion and a later local edit pushes the row back to life.
 * See docs/sync.md → "Tombstone purge". */
const TOMBSTONE_RETENTION_DAYS = 90;

/** Delete tombstones older than the retention window (live rows are never
 * touched). Returns the number of rows removed. */
export const purgeTombstones = async (): Promise<number> => {
  const result = await db
    .delete(syncRow)
    .where(
      and(
        eq(syncRow.deleted, true),
        lt(
          syncRow.serverUpdatedAt,
          sql`now() - make_interval(days => ${TOMBSTONE_RETENTION_DAYS})`,
        ),
      ),
    );
  return result.rowCount ?? 0;
};
