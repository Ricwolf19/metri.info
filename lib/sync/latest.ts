import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { syncRow } from "@/lib/db/schema";
import { event } from "@/lib/log/logger";
import { readSyncTable } from "@/lib/sync/body";
import { asRow, isDate, num, str } from "@/lib/sync/rows";

/**
 * The newest body readings the phone has synced, for seeding calculators:
 * one weigh-in, one body-fat reading, the latest tape at the sites a
 * calculator asks for, and the active phase. Small, targeted reads (not the
 * whole history `getBodySnapshot` loads), guarded the same way: the mirror's
 * JSON is the app's, so anything malformed is skipped.
 */

const TAPE_SITES = ["waist", "neck", "hips"] as const;
type TapeSite = (typeof TAPE_SITES)[number];

type ActiveGoal = {
  phase: string;
  startWeightKg: number | null;
  rateKgPerWeek: number | null;
  durationWeeks: number | null;
  tdeeAtStart: number | null;
};

export type LatestBodyLogs = {
  weightKg: number | null;
  bodyFatPct: number | null;
  tape: Partial<Record<TapeSite, number>>;
  goal: ActiveGoal | null;
};

const EMPTY: LatestBodyLogs = {
  weightKg: null,
  bodyFatPct: null,
  tape: {},
  goal: null,
};

/** Enough recent days to find both a weigh-in and a body-fat reading. */
const METRIC_DAYS = 60;

const latestMetrics = async (userId: string) => {
  const rows = await db
    .select({ data: syncRow.data })
    .from(syncRow)
    .where(
      and(
        eq(syncRow.userId, userId),
        eq(syncRow.tableName, "body_metrics"),
        eq(syncRow.deleted, false),
      ),
    )
    // `date` is the app's local YYYY-MM-DD, so text order is date order.
    .orderBy(desc(sql`${syncRow.data}->>'date'`))
    .limit(METRIC_DAYS);
  let weightKg: number | null = null;
  let bodyFatPct: number | null = null;
  for (const { data } of rows) {
    const r = asRow(data);
    if (!r || !isDate(r.date)) continue;
    const w = num(r.weight_kg);
    const f = num(r.body_fat_pct);
    if (weightKg === null && w !== null && w > 0) weightKg = w;
    if (bodyFatPct === null && f !== null && f > 0) bodyFatPct = f;
    if (weightKg !== null && bodyFatPct !== null) break;
  }
  return { weightKg, bodyFatPct };
};

const latestTape = async (userId: string) => {
  const site = sql<string>`${syncRow.data}->>'site'`;
  const rows = await db
    .selectDistinctOn([site], { site, data: syncRow.data })
    .from(syncRow)
    .where(
      and(
        eq(syncRow.userId, userId),
        eq(syncRow.tableName, "body_measurements"),
        eq(syncRow.deleted, false),
        inArray(site, [...TAPE_SITES]),
      ),
    )
    .orderBy(site, desc(sql`${syncRow.data}->>'date'`));
  const tape: Partial<Record<TapeSite, number>> = {};
  for (const row of rows) {
    const r = asRow(row.data);
    const cm = r ? num(r.value_cm) : null;
    const id = TAPE_SITES.find((s) => s === row.site);
    if (id && r && isDate(r.date) && cm !== null && cm > 0) tape[id] = cm;
  }
  return tape;
};

const activeGoal = async (userId: string): Promise<ActiveGoal | null> => {
  const goals = await readSyncTable(userId, "body_goals");
  const g = goals.find((r) => r.ended_at == null && str(r.phase));
  if (!g) return null;
  return {
    phase: str(g.phase) ?? "maintain",
    startWeightKg: num(g.start_weight_kg),
    rateKgPerWeek: num(g.rate_kg_per_week),
    durationWeeks: num(g.duration_weeks),
    tdeeAtStart: num(g.tdee_at_start),
  };
};

export const getLatestBodyLogs = async (
  userId: string,
): Promise<LatestBodyLogs> => {
  try {
    const [metrics, tape, goal] = await Promise.all([
      latestMetrics(userId),
      latestTape(userId),
      activeGoal(userId),
    ]);
    return { ...metrics, tape, goal };
  } catch (error) {
    event.warn("sync.latest-failed", { userId, error: String(error) });
    return EMPTY;
  }
};
