import { sql } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/lib/db";
import { LIMITS } from "@/lib/sync/contract";
import { applyPush, pullSince, purgeTombstones } from "@/lib/sync/store";

/**
 * The real store SQL (upserts, `clock_timestamp()`, LWW `setWhere`, origin
 * filter, purge window) against a real Postgres — PGlite, in-memory. Mocking
 * the db here would only assert our own mock.
 *
 * `@/lib/db` is swapped for a PGlite-backed Drizzle instance. The neon-http
 * `db.batch` (one non-interactive transaction) is emulated by running the
 * statements inside a PGlite transaction — same atomicity contract.
 */
vi.mock("@/lib/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");

  const client = new PGlite();
  await client.exec(`
    create table "user" (id text primary key);
    create table "sync_row" (
      "user_id" text not null references "user"("id") on delete cascade,
      "table_name" text not null,
      "row_id" text not null,
      "data" jsonb,
      "deleted" boolean default false not null,
      "origin" text,
      "updated_at" timestamp not null,
      "server_updated_at" timestamp default now() not null,
      constraint "sync_row_user_id_table_name_row_id_pk"
        primary key ("user_id", "table_name", "row_id")
    );
    create index "sync_row_pull_idx" on "sync_row" ("user_id", "server_updated_at");
    insert into "user" (id) values ('u1'), ('u2');
  `);

  const real = drizzle(client);
  const batch = async (statements: Promise<unknown>[]) => {
    await client.exec("begin");
    try {
      const out = [];
      for (const statement of statements) out.push(await statement);
      await client.exec("commit");
      return out;
    } catch (error) {
      await client.exec("rollback");
      throw error;
    }
  };
  return {
    db: new Proxy(real, {
      get: (t, p) => (p === "batch" ? batch : Reflect.get(t, p)),
    }),
  };
});

const row = (id: string, updatedAt: number, data: unknown = { reps: 5 }) => ({
  table: "set_logs",
  id,
  updatedAt,
  data,
});

const T0 = 1_750_000_000_000;

const drain = async (userId: string, deviceId: string | null) => {
  const rows = [];
  let cursor: string | null = null;
  for (let page = 0; page < 10; page++) {
    const result = await pullSince(userId, cursor, deviceId);
    rows.push(...result.rows);
    if (result.cursor === cursor || !result.hasMore) break;
    cursor = result.cursor;
  }
  return rows;
};

beforeEach(async () => {
  await db.execute(sql`truncate table sync_row`);
});

describe("applyPush → pullSince roundtrip", () => {
  it("stores a pushed row and serves it back", async () => {
    await applyPush("u1", [row("r1", T0)], [], null);
    const { rows, hasMore } = await pullSince("u1", null, null);
    expect(rows).toEqual([
      {
        table: "set_logs",
        id: "r1",
        data: { reps: 5 },
        deleted: false,
        updatedAt: T0,
      },
    ]);
    expect(hasMore).toBe(false);
  });

  it("never leaks rows across users", async () => {
    await applyPush("u1", [row("r1", T0)], [], null);
    const { rows } = await pullSince("u2", null, null);
    expect(rows).toEqual([]);
  });

  it("serves a tombstone with cleared data", async () => {
    await applyPush(
      "u1",
      [],
      [{ table: "set_logs", id: "r1", deletedAt: T0 }],
      null,
    );
    const { rows } = await pullSince("u1", null, null);
    expect(rows[0]).toMatchObject({ id: "r1", deleted: true, data: null });
  });
});

describe("Last-Write-Wins", () => {
  it("an older push does not overwrite a newer stored row", async () => {
    await applyPush("u1", [row("r1", T0, { reps: 8 })], [], null);
    await applyPush("u1", [row("r1", T0 - 60_000, { reps: 1 })], [], null);
    const { rows } = await pullSince("u1", null, null);
    expect(rows[0].data).toEqual({ reps: 8 });
    expect(rows[0].updatedAt).toBe(T0);
  });

  it("an identical-timestamp push (an echo) does not rewrite the row", async () => {
    await applyPush("u1", [row("r1", T0, { reps: 8 })], [], "dev-a");
    const first = await pullSince("u1", null, null);

    // Device B re-pushes the very row it just pulled — same updatedAt.
    await applyPush("u1", [row("r1", T0, { reps: 8 })], [], "dev-b");
    const second = await pullSince("u1", null, null);

    // serverUpdatedAt untouched → the other devices' cursors stay ahead of it.
    expect(second.cursor).toBe(first.cursor);
  });

  it("a strictly newer push wins", async () => {
    await applyPush("u1", [row("r1", T0, { reps: 8 })], [], null);
    await applyPush("u1", [row("r1", T0 + 1, { reps: 12 })], [], null);
    const { rows } = await pullSince("u1", null, null);
    expect(rows[0].data).toEqual({ reps: 12 });
  });
});

describe("echo suppression (origin)", () => {
  it("does not serve a device its own writes, but serves everyone else", async () => {
    await applyPush("u1", [row("r1", T0)], [], "dev-a");
    expect((await pullSince("u1", null, "dev-a")).rows).toEqual([]);
    expect((await pullSince("u1", null, "dev-b")).rows).toHaveLength(1);
  });

  it("always serves legacy rows with no origin", async () => {
    await applyPush("u1", [row("r1", T0)], [], null);
    expect((await pullSince("u1", null, "dev-a")).rows).toHaveLength(1);
  });
});

describe("pagination", () => {
  it("delivers every row of a large batch exactly once across pages", async () => {
    const count = LIMITS.pullPage + 100;
    const rows = Array.from({ length: count }, (_, i) => row(`r${i}`, T0 + i));
    await applyPush("u1", rows, [], "dev-a");

    const pulled = await drain("u1", "dev-b");
    expect(new Set(pulled.map((r) => r.id)).size).toBe(count);
  });

  it("stamps rows of one batch with distinct server times (clock_timestamp)", async () => {
    // Regression for the `now()`/`defaultNow()` bug: transaction time is the
    // same for every row, which collapses the cursor ordering.
    await applyPush(
      "u1",
      Array.from({ length: 300 }, (_, i) => row(`r${i}`, T0 + i)),
      [],
      null,
    );
    const distinct = await db.execute(
      sql`select count(distinct server_updated_at) as n from sync_row`,
    );
    expect(Number(distinct.rows[0].n)).toBeGreaterThan(1);
  });
});

describe("purgeTombstones", () => {
  it("removes only tombstones older than the retention window", async () => {
    await applyPush("u1", [row("live", T0)], [], null);
    await applyPush(
      "u1",
      [],
      [{ table: "set_logs", id: "fresh-del", deletedAt: T0 }],
      null,
    );
    // An expired tombstone can only exist with an old server stamp — backdate it.
    await db.execute(sql`
      insert into sync_row (user_id, table_name, row_id, data, deleted, updated_at, server_updated_at)
      values ('u1', 'set_logs', 'old-del', null, true, to_timestamp(${T0 / 1000}), now() - interval '91 days')
    `);

    await purgeTombstones();

    const left = await db.execute(
      sql`select row_id from sync_row order by row_id`,
    );
    expect(left.rows.map((r) => r.row_id)).toEqual(["fresh-del", "live"]);
  });
});
