import "server-only";

import { and, asc, eq, gt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { syncRow } from "@/lib/db/schema";

/**
 * Server side of the premium delta sync. Rows are opaque JSON keyed by
 * (user, table, row). Writes are Last-Write-Wins on the client's `updatedAt`
 * (epoch ms); reads are delta by `serverUpdatedAt` (the pull cursor). The user
 * is always taken from the session — never from the payload.
 */

export type PushRow = {
  table: string;
  id: string;
  updatedAt: number;
  data: unknown;
};
export type PushDeletion = { table: string; id: string; deletedAt: number };

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

  for (let i = 0; i < values.length; i += CHUNK) {
    await db
      .insert(syncRow)
      .values(values.slice(i, i + CHUNK))
      .onConflictDoUpdate({
        target: [syncRow.userId, syncRow.tableName, syncRow.rowId],
        set: {
          data: sql`excluded.data`,
          deleted: sql`excluded.deleted`,
          updatedAt: sql`excluded.updated_at`,
          serverUpdatedAt: sql`now()`,
        },
        // LWW: only accept the incoming row if it isn't older than what we hold.
        setWhere: sql`excluded.updated_at >= ${syncRow.updatedAt}`,
      });
  }
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
};

/** Everything for this user changed after `since` (ISO server time), oldest-first. */
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

  const rows = await db
    .select()
    .from(syncRow)
    .where(where)
    .orderBy(asc(syncRow.serverUpdatedAt));

  // The new cursor is the newest server time we returned — gap-free for a single
  // query, and rows written afterwards are picked up on the next pull.
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
  };
};
