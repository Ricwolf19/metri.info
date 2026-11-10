import "server-only";

import { and, count, desc, eq, gte, lt } from "drizzle-orm";

import { isSiteId, keySiteFor } from "@/lib/body/sites";
import { dateKey, type WeighIn } from "@/lib/body/weekly";
import { db } from "@/lib/db";
import { calculationLog, quizAttempt } from "@/lib/db/schema";
import { parseScores } from "@/lib/quiz/scores";
import {
  buildMuscleIndex,
  parseWorkingSets,
  readSyncTable,
} from "@/lib/sync/body";
import { foodTotalsByDay, isDate, num, str } from "@/lib/sync/rows";

import {
  previousPeriod,
  type ReportGoal,
  type ReportInput,
  type ReportSession,
  type ReportTape,
} from "./monthly";
import type { TipsReason, TipsSignals } from "./tips";

/** The month plus the three it is compared against. */
const COMPARISON_MONTHS = 3;

const monthStart = (period: string): Date => new Date(`${period}-01T00:00:00Z`);
const nextMonthStart = (period: string): Date => {
  const start = monthStart(period);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
};

export type ReportData = {
  input: ReportInput;
  customNames: Record<string, string>;
};

/**
 * One account's sync mirror, shaped for `buildMonthlyReport`. Sessions and
 * their sets are placed on the device-local day the app's adherence ledger
 * recorded, so a late-night set never lands in the wrong month; a session the
 * ledger doesn't cover falls back to its UTC day. Throws on a failed read: the
 * caller must retry, not mistake a database blip for an empty month.
 */
export const loadReportData = async (
  userId: string,
  sex: string | null | undefined,
  period: string,
): Promise<ReportData> => {
  const earliest = monthStart(previousPeriod(period, COMPARISON_MONTHS));
  const sinceKey = dateKey(earliest);
  const [metrics, tapeRows, logs, setRows, customs, days, foods, goals] =
    await Promise.all([
      readSyncTable(userId, "body_metrics"),
      readSyncTable(userId, "body_measurements"),
      readSyncTable(userId, "workout_logs"),
      readSyncTable(userId, "set_logs", earliest.getTime()),
      readSyncTable(userId, "exercises"),
      readSyncTable(userId, "training_days"),
      readSyncTable(userId, "food_logs"),
      readSyncTable(userId, "body_goals"),
    ]);

  const { index, customNames } = buildMuscleIndex(customs);
  const { sets, completed } = parseWorkingSets(logs, setRows);

  const localDayOfLog = new Map<string, string>();
  const skippedDays: string[] = [];
  for (const r of days) {
    if (!isDate(r.date)) continue;
    const logId = str(r.workout_log_id);
    if (logId) localDayOfLog.set(logId, r.date);
    if (r.status === "skipped") skippedDays.push(r.date);
  }
  const localDay = (logId: string, at: number) =>
    localDayOfLog.get(logId) ?? dateKey(new Date(at));

  const durations = new Map<string, number | null>();
  for (const r of logs) {
    const id = str(r.id);
    if (id) durations.set(id, num(r.duration_seconds));
  }
  const sessions: ReportSession[] = [...completed]
    .map(([id, startedAt]) => ({
      id,
      date: localDay(id, startedAt),
      durationSeconds: durations.get(id) ?? null,
    }))
    .filter((s) => s.date >= sinceKey);

  const reportSets = sets.map((s) => ({
    ...s,
    date: localDay(s.logId, completed.get(s.logId) ?? s.at),
  }));

  const weighIns: WeighIn[] = [];
  for (const r of metrics) {
    const weightKg = num(r.weight_kg);
    if (
      isDate(r.date) &&
      r.date >= sinceKey &&
      weightKg !== null &&
      weightKg > 0
    )
      weighIns.push({ date: r.date, weightKg });
  }

  const tape: ReportTape[] = [];
  for (const r of tapeRows) {
    const cm = num(r.value_cm);
    if (isSiteId(r.site) && isDate(r.date) && cm !== null && cm > 0)
      tape.push({ site: r.site, date: r.date, cm });
  }

  const active = goals.find((g) => g.ended_at == null && str(g.phase));
  const goal: ReportGoal | null = active
    ? {
        phase: str(active.phase) ?? "maintain",
        targetKcal: num(active.target_kcal),
        proteinG: num(active.protein_g),
      }
    : null;

  return {
    input: {
      period,
      sessions,
      sets: reportSets,
      skippedDays,
      weighIns,
      tape,
      food: foodTotalsByDay(foods, sinceKey),
      goal,
      index,
      keySite: keySiteFor(sex),
    },
    customNames,
  };
};

/** What the site itself knows about an account, for the tips edition. */
export const loadTipsSignals = async (
  userId: string,
  period: string,
  reason: TipsReason,
  latestVersion: string | null,
): Promise<TipsSignals> => {
  const inMonth = and(
    eq(calculationLog.userId, userId),
    gte(calculationLog.createdAt, monthStart(period)),
    lt(calculationLog.createdAt, nextMonthStart(period)),
  );
  const [calculations, [attempt]] = await Promise.all([
    db
      .select({ type: calculationLog.calculatorType, value: count() })
      .from(calculationLog)
      .where(inMonth)
      .groupBy(calculationLog.calculatorType)
      .orderBy(desc(count())),
    db
      .select({ scores: quizAttempt.scores })
      .from(quizAttempt)
      .where(eq(quizAttempt.userId, userId))
      .orderBy(desc(quizAttempt.createdAt))
      .limit(1),
  ]);
  return {
    reason,
    calculations: calculations.reduce((sum, c) => sum + c.value, 0),
    topCalculator: calculations[0]?.type ?? null,
    quizScores: attempt ? parseScores(attempt.scores) : null,
    latestVersion,
  };
};
