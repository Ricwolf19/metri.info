import { sql } from "drizzle-orm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { getLatestBodyLogs } from "@/lib/sync/latest";

import type { Answers } from "./diagnostic";
import { startRoadmap } from "./state";
import { readEvidence, readRoadmap, writeRoadmap } from "./store";

/**
 * The roadmap's and the calculator prefill's SQL (jsonb text ordering,
 * DISTINCT ON per tape site, MAX per calculator, the upsert) against a real
 * Postgres — PGlite, in-memory. These readers swallow errors and return
 * "nothing seen", so a broken query would otherwise fail silently.
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
      primary key ("user_id", "table_name", "row_id")
    );
    create table "calculation_log" (
      "id" text primary key,
      "user_id" text references "user"("id") on delete cascade,
      "calculator_type" text not null,
      "inputs" jsonb not null,
      "results" jsonb not null,
      "created_at" timestamp default now() not null
    );
    create table "quiz_attempt" (
      "id" text primary key,
      "user_id" text not null references "user"("id") on delete cascade,
      "scores" jsonb not null,
      "misses" jsonb,
      "asked" integer not null,
      "created_at" timestamp with time zone default now() not null
    );
    create table "user_profile" (
      "id" text primary key references "user"("id") on delete cascade,
      "latest_tdee" real,
      "updated_at" timestamp default now() not null
    );
    create table "roadmap" (
      "user_id" text primary key references "user"("id") on delete cascade,
      "answers" jsonb not null,
      "started_at" timestamp with time zone not null,
      "done" jsonb not null,
      "history" jsonb not null,
      "updated_at" timestamp with time zone default now() not null
    );
    insert into "user" (id) values ('u1'), ('u2');
  `);
  return { db: drizzle(client) };
});

const NOW = new Date("2026-11-16T12:00:00Z");

const ANSWERS: Answers = {
  goal: "lose_fat",
  sex: "female",
  bodyFatPct: 27,
  bodyFatBand: null,
  weightKg: 70,
  experience: "beginner",
  trainingNow: "consistent",
  tracking: "now",
  sleep: "seven_plus",
  dietHistory: "none",
  caution: false,
};

const seed = async () => {
  const { db } = await import("@/lib/db");
  const { calculationLog, quizAttempt, syncRow } =
    await import("@/lib/db/schema");
  const row = (table: string, id: string, data: unknown, deleted = false) => ({
    userId: "u1",
    tableName: table,
    rowId: id,
    data,
    deleted,
    updatedAt: NOW,
  });
  await db.insert(syncRow).values([
    // Weigh-ins: newest by `date`, not by row order; one without a weight.
    row("body_metrics", "m1", { date: "2026-11-15", weight_kg: 70.4 }),
    row("body_metrics", "m2", { date: "2026-11-16", body_fat_pct: 26.5 }),
    row("body_metrics", "m3", { date: "2026-11-14", weight_kg: 70.9 }),
    row("body_metrics", "m4", { date: "2026-11-13", weight_kg: 71 }),
    row("body_metrics", "m5", { date: "2026-11-12", weight_kg: 71.2 }),
    row("body_metrics", "m6", { date: "2026-11-11", weight_kg: 71.1 }),
    // Tape: the latest per site wins; a deleted newer reading doesn't.
    row("body_measurements", "t1", {
      site: "waist",
      date: "2026-11-01",
      value_cm: 80,
    }),
    row("body_measurements", "t2", {
      site: "waist",
      date: "2026-11-14",
      value_cm: 78.5,
    }),
    row(
      "body_measurements",
      "t3",
      { site: "waist", date: "2026-11-16", value_cm: 70 },
      true,
    ),
    row("body_measurements", "t4", {
      site: "hips",
      date: "2026-11-10",
      value_cm: 98,
    }),
    row("body_measurements", "t5", {
      site: "chest",
      date: "2026-11-15",
      value_cm: 90,
    }),
    // The active goal; an ended one is ignored.
    row("body_goals", "g1", {
      phase: "bulk",
      ended_at: 1_700_000_000_000,
      start_weight_kg: 60,
    }),
    row("body_goals", "g2", {
      phase: "cut",
      ended_at: null,
      start_weight_kg: 72,
      rate_kg_per_week: -0.4,
      duration_weeks: 10,
      tdee_at_start: 2150,
    }),
    // Another account's data never leaks in.
    {
      ...row("body_metrics", "x1", { date: "2026-11-16", weight_kg: 99 }),
      userId: "u2",
    },
  ]);
  await db.insert(calculationLog).values([
    {
      id: "c1",
      userId: "u1",
      calculatorType: "tdee",
      inputs: {},
      results: {},
      createdAt: new Date("2026-10-01T00:00:00Z"),
    },
    {
      id: "c2",
      userId: "u1",
      calculatorType: "tdee",
      inputs: {},
      results: {},
      createdAt: new Date("2026-11-02T00:00:00Z"),
    },
    {
      id: "c3",
      userId: "u1",
      calculatorType: "protein",
      inputs: {},
      results: {},
      createdAt: new Date("2026-11-03T00:00:00Z"),
    },
  ]);
  await db.insert(quizAttempt).values({
    id: "q1",
    userId: "u1",
    scores: {},
    asked: 32,
    createdAt: new Date("2026-11-04T00:00:00Z"),
  });
  // Raw: Drizzle would name every profile column, the table here has three.
  await db.execute(
    sql`insert into "user_profile" (id, latest_tdee, updated_at) values ('u1', 2200, '2026-09-01T00:00:00')`,
  );
};

beforeAll(seed);

describe("getLatestBodyLogs", () => {
  it("reads the newest weigh-in, body fat, tape per site and the active goal", async () => {
    const logs = await getLatestBodyLogs("u1");
    expect(logs.weightKg).toBe(70.4);
    expect(logs.bodyFatPct).toBe(26.5);
    expect(logs.tape).toEqual({ waist: 78.5, hips: 98 });
    expect(logs.goal).toMatchObject({
      phase: "cut",
      startWeightKg: 72,
      rateKgPerWeek: -0.4,
      durationWeeks: 10,
      tdeeAtStart: 2150,
    });
  });

  it("is empty for an account with nothing synced", async () => {
    expect(await getLatestBodyLogs("u2")).toMatchObject({
      bodyFatPct: null,
      tape: {},
      goal: null,
    });
  });
});

describe("readEvidence", () => {
  it("dates each step from the account's own records", async () => {
    const evidence = await readEvidence("u1", NOW);
    expect(evidence.maintenance).toBe("2026-11-02T00:00:00.000Z");
    expect(evidence.protein).toBe("2026-11-03T00:00:00.000Z");
    expect(evidence.knowledge).toBe("2026-11-04T00:00:00.000Z");
    expect(evidence.weighIns).toBe("2026-11-15T23:59:59.000Z");
    // Any tape site counts (the chest, on the 15th); the deleted waist
    // reading on the 16th doesn't.
    expect(evidence.baseline).toBe("2026-11-15T23:59:59.000Z");
    expect(evidence.calories).toBeUndefined();
  });
});

describe("readRoadmap / writeRoadmap", () => {
  it("upserts one row per account and reads it back parsed", async () => {
    expect(await readRoadmap("u1")).toBeNull();
    const first = startRoadmap(ANSWERS, new Date("2026-11-01T00:00:00Z"), null);
    await writeRoadmap("u1", first);
    const next = { ...first, done: { measure: "2026-11-02T00:00:00.000Z" } };
    await writeRoadmap("u1", next);
    expect(await readRoadmap("u1")).toEqual(next);
    expect(await readRoadmap("u2")).toBeNull();
  });
});
