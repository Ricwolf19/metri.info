import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { isSiteId, keySiteFor, type SiteId } from "@/lib/body/sites";
import {
  dateKey,
  type WeighIn,
  type WeekAverage,
  weeklyAverages,
} from "@/lib/body/weekly";
import { db } from "@/lib/db";
import { syncRow } from "@/lib/db/schema";
import { event } from "@/lib/log/logger";
import { EXERCISE_CATALOG } from "@/lib/training/catalog";
import {
  type ExerciseMuscles,
  headShares,
  type LoadedSet,
  muscleBalance,
  muscleFatigue,
  type MuscleIndex,
  muscleStrength,
} from "@/lib/training/muscle-load";
import {
  isExerciseCategory,
  MUSCLE_HEADS,
  type MuscleHead,
} from "@/lib/training/muscles";
import {
  type BodyWindow,
  type HeadExercise,
  type WindowLoads,
} from "@/lib/body/windows";

/**
 * Read-only body view over the premium sync mirror: weigh-ins as weekly
 * averages, tape sites, and the per-muscle load behind the body map, for the
 * three windows the app's Metrics tab offers. Same discipline as `views.ts`:
 * `sync_row.data` is opaque JSON owned by the phone, every field is guarded
 * and anything malformed is dropped rather than rendered.
 */

export type BodyFatReading = { date: string; pct: number };
export type TapeReading = { date: string; cm: number };

export type SiteSeries = {
  site: SiteId;
  latest: TapeReading;
  previous: TapeReading | null;
  /** Change since the previous reading, cm. */
  deltaCm: number | null;
  series: TapeReading[];
};

export type BodySnapshot = {
  /** True when at least one row of the body or training tables exists. */
  hasAnyData: boolean;
  /** Daily weigh-ins inside `historyDays`, oldest first. */
  weighIns: WeighIn[];
  bodyFat: BodyFatReading[];
  /** Week buckets across the history, oldest first; the last is this week. */
  weeks: WeekAverage[];
  thisWeekAvgKg: number | null;
  /** This week's average against the previous week with data. */
  weightDeltaKg: number | null;
  keySite: SiteId;
  keySiteDeltaCm: number | null;
  sites: SiteSeries[];
  muscles: Record<BodyWindow, WindowLoads>;
  /** Names of custom exercises, by id (catalog names live in the content). */
  customNames: Record<string, string>;
  today: string;
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
const strList = (v: unknown): string[] | null =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : null;

const MS_PER_DAY = 86_400_000;

const LIMITS = {
  body_metrics: 400,
  body_measurements: 3000,
  workout_logs: 400,
  set_logs: 8000,
  exercises: 400,
} as const;

const readTable = async (
  userId: string,
  table: keyof typeof LIMITS,
  sinceMs?: number,
): Promise<Row[]> => {
  const rows = await db
    .select({ rowId: syncRow.rowId, data: syncRow.data })
    .from(syncRow)
    .where(
      and(
        eq(syncRow.userId, userId),
        eq(syncRow.tableName, table),
        eq(syncRow.deleted, false),
        // Epoch-ms columns are numbers in the app's JSON; the cast tolerates
        // a stringified one and the regex keeps junk out of it.
        sinceMs === undefined
          ? undefined
          : sql`(${syncRow.data}->>'created_at') ~ '^[0-9]+$' AND (${syncRow.data}->>'created_at')::numeric >= ${sinceMs}`,
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

const emptyWindow = (): WindowLoads => ({
  loads: { balance: [], fatigue: [], strength: [] },
  sets: 0,
  sessions: 0,
  topByHead: Object.fromEntries(
    MUSCLE_HEADS.map((h) => [h, [] as HeadExercise[]]),
  ) as Record<MuscleHead, HeadExercise[]>,
});

const EMPTY: BodySnapshot = {
  hasAnyData: false,
  weighIns: [],
  bodyFat: [],
  weeks: [],
  thisWeekAvgKg: null,
  weightDeltaKg: null,
  keySite: "waist",
  keySiteDeltaCm: null,
  sites: [],
  muscles: { 7: emptyWindow(), 30: emptyWindow(), 90: emptyWindow() },
  customNames: {},
  today: "",
};

const windowLoads = (
  sets: readonly LoadedSet[],
  sessionStarts: readonly number[],
  index: MuscleIndex,
  days: BodyWindow,
  now: number,
): WindowLoads => {
  const since = now - days * MS_PER_DAY;
  const inWindow = sets.filter((s) => s.at >= since);
  const byHead = new Map<MuscleHead, Map<string, number>>();
  for (const set of inWindow) {
    for (const [head, share] of headShares(index.get(set.exerciseId))) {
      const m = byHead.get(head) ?? new Map<string, number>();
      m.set(set.exerciseId, (m.get(set.exerciseId) ?? 0) + share);
      byHead.set(head, m);
    }
  }
  const topByHead = Object.fromEntries(
    MUSCLE_HEADS.map((head) => [
      head,
      [...(byHead.get(head) ?? new Map<string, number>()).entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, n]) => ({ id, sets: Math.round(n * 10) / 10 })),
    ]),
  ) as Record<MuscleHead, HeadExercise[]>;
  return {
    loads: {
      balance: muscleBalance(inWindow, index, days / 7),
      fatigue: muscleFatigue(inWindow, index, now),
      strength: muscleStrength(inWindow, index, now),
    },
    sets: inWindow.length,
    sessions: sessionStarts.filter((t) => t >= since).length,
    topByHead,
  };
};

export const getBodySnapshot = async (
  userId: string,
  sex: string | null | undefined,
  historyDays = 90,
): Promise<BodySnapshot> => {
  const now = Date.now();
  const today = dateKey(new Date(now));
  const sinceMs = now - historyDays * MS_PER_DAY;
  const sinceKey = dateKey(new Date(sinceMs));
  try {
    const [metrics, tape, logs, setRows, customs] = await Promise.all([
      readTable(userId, "body_metrics"),
      readTable(userId, "body_measurements"),
      readTable(userId, "workout_logs"),
      readTable(userId, "set_logs", sinceMs),
      readTable(userId, "exercises"),
    ]);

    const weighIns: WeighIn[] = [];
    const bodyFat: BodyFatReading[] = [];
    for (const r of metrics) {
      if (!isDate(r.date) || r.date < sinceKey) continue;
      const w = num(r.weight_kg);
      if (w !== null && w > 0) weighIns.push({ date: r.date, weightKg: w });
      const f = num(r.body_fat_pct);
      if (f !== null && f > 0) bodyFat.push({ date: r.date, pct: f });
    }
    weighIns.sort((a, b) => a.date.localeCompare(b.date));
    bodyFat.sort((a, b) => a.date.localeCompare(b.date));

    // Weeks run back from today so the last bucket is always "this week".
    const weekCount = Math.ceil(historyDays / 7);
    const anchor = dateKey(new Date(now - (weekCount * 7 - 1) * MS_PER_DAY));
    const weeks = weeklyAverages(weighIns, anchor, weekCount);
    const thisWeek = weeks[weeks.length - 1] ?? null;
    const lastWithData = [...weeks]
      .slice(0, -1)
      .reverse()
      .find((w) => w.avgKg !== null);
    const thisWeekAvgKg = thisWeek?.avgKg ?? null;
    const weightDeltaKg =
      thisWeekAvgKg !== null && lastWithData?.avgKg != null
        ? Math.round((thisWeekAvgKg - lastWithData.avgKg) * 100) / 100
        : null;

    const bySite = new Map<SiteId, TapeReading[]>();
    for (const r of tape) {
      const cm = num(r.value_cm);
      if (!isSiteId(r.site) || !isDate(r.date) || cm === null || cm <= 0)
        continue;
      const list = bySite.get(r.site) ?? [];
      list.push({ date: r.date, cm });
      bySite.set(r.site, list);
    }
    const sites: SiteSeries[] = [];
    for (const [site, list] of bySite) {
      list.sort((a, b) => a.date.localeCompare(b.date));
      const latest = list[list.length - 1];
      const previous = list.length > 1 ? list[list.length - 2] : null;
      sites.push({
        site,
        latest,
        previous,
        deltaCm: previous
          ? Math.round((latest.cm - previous.cm) * 10) / 10
          : null,
        series: list.filter((r) => r.date >= sinceKey),
      });
    }
    const keySite = keySiteFor(sex);
    const keySiteDeltaCm =
      sites.find((s) => s.site === keySite)?.deltaCm ?? null;

    const index = new Map<string, ExerciseMuscles>();
    for (const e of EXERCISE_CATALOG)
      index.set(e.id, {
        primary: e.primary,
        secondary: e.secondary,
        category: e.category,
      });
    const customNames: Record<string, string> = {};
    for (const r of customs) {
      const id = str(r.id);
      if (!id || !isExerciseCategory(r.category)) continue;
      index.set(id, {
        primary: strList(r.primary_muscles),
        secondary: strList(r.secondary_muscles),
        category: r.category,
      });
      const name = str(r.name);
      if (name) customNames[id] = name;
    }

    const completed = new Map<string, number>();
    for (const r of logs) {
      const id = str(r.id);
      const startedAt = num(r.started_at);
      if (id && startedAt !== null && r.status === "completed")
        completed.set(id, startedAt);
    }
    const sets: LoadedSet[] = [];
    for (const r of setRows) {
      const logId = str(r.workout_log_id);
      const exerciseId = str(r.exercise_id);
      const reps = num(r.reps);
      const weightKg = num(r.weight_kg);
      const at = num(r.created_at);
      if (
        !logId ||
        !completed.has(logId) ||
        !exerciseId ||
        reps === null ||
        weightKg === null ||
        at === null ||
        r.is_warmup === true
      )
        continue;
      sets.push({
        exerciseId,
        reps,
        weightKg,
        rir: num(r.rir),
        isFailure: r.is_failure === true,
        at,
      });
    }
    const sessionStarts = [...completed.values()];

    return {
      hasAnyData:
        metrics.length + tape.length + logs.length + setRows.length > 0,
      weighIns,
      bodyFat,
      weeks,
      thisWeekAvgKg,
      weightDeltaKg,
      keySite,
      keySiteDeltaCm,
      sites,
      muscles: {
        7: windowLoads(sets, sessionStarts, index, 7, now),
        30: windowLoads(sets, sessionStarts, index, 30, now),
        90: windowLoads(sets, sessionStarts, index, 90, now),
      },
      customNames,
      today,
    };
  } catch (error) {
    event.warn("sync.body-failed", { userId, error: String(error) });
    return { ...EMPTY, keySite: keySiteFor(sex), today };
  }
};
