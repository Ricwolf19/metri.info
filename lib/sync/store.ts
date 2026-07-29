import "server-only";

import { and, asc, eq, gt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { syncRow } from "@/lib/db/schema";
import { LIMITS, type PushDeletion, type PushRow } from "@/lib/sync/contract";

/**
 * Server side of the premium delta sync. Rows are opaque JSON keyed by
 * (user, table, row). Writes are Last-Write-Wins on the client's `updatedAt`
 * (epoch ms); reads are delta by `serverUpdatedAt` (the pull cursor).
 *
 * `userId` is a parameter, always sourced from the session by the route — it is
 * never read from the payload, which is what keeps one user out of another's
 * rows. Everything else arriving from the client goes through
 * `lib/sync/contract` first.
 */

const CHUNK = 200;

export const applyPush = async (
  userId: string,
  rows: PushRow[],
  deletions: PushDeletion[],
): Promise<void> => {
  const values = [
    ...rows.map((r) => ({
      userId,
      tableName: r.table,
      rowId: r.id,
      data: r.data as unknown,
      deleted: false,
      updatedAt: new Date(r.updatedAt),
    })),
    ...deletions.map((d) => ({
      userId,
      tableName: d.table,
      rowId: d.id,
      data: null,
      deleted: true,
      updatedAt: new Date(d.deletedAt),
    })),
  ];
  if (!values.length) return;

  // One transaction for the whole batch: a mid-loop failure used to leave some
  // chunks committed and the client's watermark advanced past rows that never
  // landed.
  await db.transaction(async (tx) => {
    for (let i = 0; i < values.length; i += CHUNK) {
      await tx
        .insert(syncRow)
        .values(values.slice(i, i + CHUNK))
        .onConflictDoUpdate({
          target: [syncRow.userId, syncRow.tableName, syncRow.rowId],
          set: {
            data: sql`excluded.data`,
            deleted: sql`excluded.deleted`,
            // `clock_timestamp()`, NOT `now()`: `now()` is the *transaction*
            // start time, so every row in this batch would share one value.
            // The pull cursor is `serverUpdatedAt` with a strict `>`, so a
            // batch bigger than one page would hand back 500 identical
            // timestamps, advance the cursor past them, and drop the tail
            // permanently. `clock_timestamp()` is volatile and evaluated per
            // row, so the ordering stays total.
            updatedAt: sql`excluded.updated_at`,
            serverUpdatedAt: sql`clock_timestamp()`,
          },
          // LWW: only accept the incoming row if it isn't older than what we
          // hold. `contract.ts` clamps future timestamps so a bad clock can't
          // park a row above every future write.
          setWhere: sql`excluded.updated_at >= ${syncRow.updatedAt}`,
        });
    }
  });
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

/** One page of everything for this user changed after `since` (ISO server
 * time), oldest-first. Paged so a large history can't be loaded into memory and
 * serialized in a single response. */
export const pullSince = async (
  userId: string,
  since: string | null,
): Promise<PullResult> => {
  const where = since
    ? and(
        eq(syncRow.userId, userId),
        gt(syncRow.serverUpdatedAt, new Date(since)),
      )
    : eq(syncRow.userId, userId);

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

  // The new cursor is the newest server time we returned — rows written after
  // it are picked up on the next pull.
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
