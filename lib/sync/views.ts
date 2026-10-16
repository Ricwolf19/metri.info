import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { event } from "@/lib/log/logger";
import { syncRow } from "@/lib/db/schema";

/**
 * Read-only views over the premium sync mirror for the web's Activity page.
 *
 * `sync_row.data` is opaque JSON owned by the mobile client, so every field is
 * guarded here and anything malformed is dropped rather than rendered. Column
 * names follow the app's SQLite schema (snake_case, epoch-ms timestamps,
 * `YYYY-MM-DD` local dates). If the app's `tables.ts` changes shape, this file
 * is the only place the web has to follow.
 */

export type WeighIn = { date: string; weightKg: number };
type SyncedSession = {
  id: string;
  name: string | null;
  startedAt: number;
  durationSeconds: number | null;
  weekNumber: number | null;
};
type FoodDay = { date: string; kcal: number; proteinG: number };
type NutritionPhase = {
  phase: string;
  targetKcal: number | null;
  proteinG: number | null;
  startDate: string | null;
};

export type SyncedSnapshot = {
  weighIns: WeighIn[];
  sessions: SyncedSession[];
  foodDays: FoodDay[];
  phase: NutritionPhase | null;
  /** True when at least one synced row exists for the user at all. */
  hasAnyData: boolean;
};

type Row = Record<string, unknown>;

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
const str = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;
const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const asRow = (v: unknown): Row | null =>
  typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Row) : null;

const LIMITS = {
  body_metrics: 120,
  workout_logs: 40,
  workout_days: 200,
  food_logs: 600,
  body_goals: 10,
} as const;

const readTable = async (
  userId: string,
  table: keyof typeof LIMITS,
): Promise<Row[]> => {
  const rows = await db
    .select({ rowId: syncRow.rowId, data: syncRow.data })
    .from(syncRow)
    .where(
      and(
        eq(syncRow.userId, userId),
        eq(syncRow.tableName, table),
        eq(syncRow.deleted, false),
      ),
    )
    .orderBy(desc(syncRow.updatedAt))
    .limit(LIMITS[table]);
  const out: Row[] = [];
  for (const r of rows) {
    const data = asRow(r.data);
    if (data) out.push({ id: r.rowId, ...data });
  }
  return out;
};

const WEIGH_IN_DAYS = 90;
const SESSION_COUNT = 6;
const FOOD_DAYS = 7;

export const getSyncedSnapshot = async (
  userId: string,
): Promise<SyncedSnapshot> => {
  try {
    const [metrics, logs, days, foods, goals] = await Promise.all([
      readTable(userId, "body_metrics"),
      readTable(userId, "workout_logs"),
      readTable(userId, "workout_days"),
      readTable(userId, "food_logs"),
      readTable(userId, "body_goals"),
    ]);

    const weighIns = metrics
      .map((r) => {
        const weightKg = num(r.weight_kg);
        return isDate(r.date) && weightKg !== null
          ? { date: r.date, weightKg }
          : null;
      })
      .filter((w): w is WeighIn => w !== null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-WEIGH_IN_DAYS);

    const dayNames = new Map<string, string>();
    for (const d of days) {
      const id = str(d.id);
      const name = str(d.name);
      if (id && name) dayNames.set(id, name);
    }

    const sessions = logs
      .filter((r) => r.status === "completed")
      .map((r) => {
        const id = str(r.id);
        const startedAt = num(r.started_at);
        if (!id || startedAt === null) return null;
        const dayId = str(r.workout_day_id);
        return {
          id,
          name: dayId ? (dayNames.get(dayId) ?? null) : null,
          startedAt,
          durationSeconds: num(r.duration_seconds),
          weekNumber: num(r.week_number),
        };
      })
      .filter((s): s is SyncedSession => s !== null)
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, SESSION_COUNT);

    const byDay = new Map<string, FoodDay>();
    for (const f of foods) {
      if (!isDate(f.date)) continue;
      const day = byDay.get(f.date) ?? { date: f.date, kcal: 0, proteinG: 0 };
      day.kcal += num(f.kcal) ?? 0;
      day.proteinG += num(f.protein_g) ?? 0;
      byDay.set(f.date, day);
    }
    const foodDays = [...byDay.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-FOOD_DAYS)
      .map((d) => ({
        ...d,
        kcal: Math.round(d.kcal),
        proteinG: Math.round(d.proteinG),
      }));

    const activeGoal = goals.find((g) => g.ended_at == null && str(g.phase));
    const phase: NutritionPhase | null = activeGoal
      ? {
          phase: str(activeGoal.phase) ?? "maintain",
          targetKcal: num(activeGoal.target_kcal),
          proteinG: num(activeGoal.protein_g),
          startDate: isDate(activeGoal.start_date)
            ? activeGoal.start_date
            : null,
        }
      : null;

    return {
      weighIns,
      sessions,
      foodDays,
      phase,
      hasAnyData:
        metrics.length + logs.length + foods.length + goals.length > 0,
    };
  } catch (error) {
    // Never blank a page over a sync read, but never do it silently either.
    event.warn("sync.views-failed", { userId, error: String(error) });
    return {
      weighIns: [],
      sessions: [],
      foodDays: [],
      phase: null,
      hasAnyData: false,
    };
  }
};
