import type { SiteId } from "@/lib/body/sites";
import { daysBetween, type WeighIn, weeklyAverages } from "@/lib/body/weekly";
import {
  type BalanceStatus,
  estimate1Rm,
  fractionalSets,
  type LoadedSet,
  muscleBalance,
  type MuscleIndex,
} from "@/lib/training/muscle-load";
import type { MuscleHead } from "@/lib/training/muscles";

/**
 * The monthly report: one calendar month of the sync mirror turned into a
 * verdict, a few numbers and at most a handful of observations. Pure by design
 * (no DB, no React), and built only from the helpers the app's Metrics tab
 * mirrors, so the email, the PDF and `/account/body` cannot disagree.
 *
 * Rules, not a model: the numbers stay reproducible and no health data leaves
 * for a third party to interpret. Observations are worded as observations.
 */

/** Below all three, a month has too little in it to report on. */
const MIN_SESSIONS = 4;
const MIN_WEIGH_INS = 4;
const MIN_FOOD_DAYS = 14;

const LONG_GAP_DAYS = 10;
const VOLUME_SPIKE_RATIO = 1.3;
const STRENGTH_DROP_PCT = 5;
/** Past this, a "gain" is a typo in the weight field, not a good month. */
const IMPLAUSIBLE_GAIN_PCT = 50;
const MUSCLE_DROP_RATIO = 0.5;
const TRAINING_HELD_RATIO = 0.7;
const MUSCLE_USUAL_MIN_SETS = 6;
const IMPLAUSIBLE_WEIGH_IN = 0.03;
const WEIGH_IN_NEIGHBOUR_DAYS = 7;
const MAJOR_MUSCLES: readonly MuscleHead[] = [
  "chest",
  "lats",
  "mid_back",
  "quads",
  "hamstrings",
  "glutes",
];

export type ReportSession = {
  id: string;
  /** The device-local day it counted for, `YYYY-MM-DD`. */
  date: string;
  durationSeconds: number | null;
};
export type ReportSet = LoadedSet & { date: string };
export type ReportTape = { site: SiteId; date: string; cm: number };
type ReportFoodDay = { date: string; kcal: number; proteinG: number };
export type ReportGoal = {
  phase: string;
  targetKcal: number | null;
  proteinG: number | null;
};

export type ReportInput = {
  /** `YYYY-MM`. */
  period: string;
  /** This month and the three before it, for the comparisons. */
  sessions: readonly ReportSession[];
  sets: readonly ReportSet[];
  skippedDays: readonly string[];
  weighIns: readonly WeighIn[];
  tape: readonly ReportTape[];
  food: readonly ReportFoodDay[];
  goal: ReportGoal | null;
  index: MuscleIndex;
  keySite: SiteId;
};

type StrengthChange = {
  exerciseId: string;
  fromKg: number;
  toKg: number;
  pct: number;
};

export type MuscleRow = {
  head: MuscleHead;
  setsPerWeek: number;
  usualPerWeek: number | null;
  status: BalanceStatus;
};

export type Anomaly =
  | { id: "weight_fast"; direction: "down" | "up"; ratePct: number }
  | { id: "training_gap"; days: number }
  | { id: "strength_drop"; exerciseId: string; pct: number }
  | { id: "volume_spike"; pct: number }
  | {
      id: "muscle_drop";
      head: MuscleHead;
      setsPerWeek: number;
      usualPerWeek: number;
    };

type Verdict = "first" | "strong" | "steady" | "down" | "tracking";

export type NextStep =
  | "adjust_phase"
  | "plan_days"
  | "recover"
  | "hold_volume"
  | "restore_muscle"
  | "log_food"
  | "weigh_in"
  | "keep_progressing";

/** The knowledge-base guide each next step points at. */
export const NEXT_STEP_GUIDE: Record<NextStep, string> = {
  adjust_phase: "personalizing-your-diet",
  plan_days: "volume-frequency",
  recover: "sleep",
  hold_volume: "training-intensity",
  restore_muscle: "volume-frequency",
  log_food: "macros",
  weigh_in: "measuring-progress",
  keep_progressing: "progressive-overload",
};

const STEP_FOR_ANOMALY: Record<Anomaly["id"], NextStep> = {
  weight_fast: "adjust_phase",
  training_gap: "plan_days",
  strength_drop: "recover",
  volume_spike: "hold_volume",
  muscle_drop: "restore_muscle",
};

type ReportBody = {
  weighIns: number;
  /** Readings left out as likely typos. */
  excludedWeighIns: number;
  weeks: { weekStart: string; avgKg: number | null }[];
  startKg: number | null;
  endKg: number | null;
  deltaKg: number | null;
  weeklyRatePct: number | null;
  keySite: SiteId;
  keySiteDeltaCm: number | null;
};

type ReportNutrition = {
  daysLogged: number;
  /** False when under half the month was logged: averages would mislead. */
  reliable: boolean;
  avgKcal: number | null;
  avgProteinG: number | null;
  targetKcal: number | null;
  targetProteinG: number | null;
};

export type MonthlyReport = {
  period: string;
  daysInMonth: number;
  verdict: Verdict;
  training: {
    sessions: number;
    prevSessions: number | null;
    perWeek: number;
    minutes: number;
    skippedDays: number;
    longestGapDays: number | null;
    workingSets: number;
    prevWorkingSets: number | null;
    setsPerWeek: number;
    usualSetsPerWeek: number | null;
  };
  strength: { gains: StrengthChange[]; stalled: StrengthChange[] };
  muscles: MuscleRow[];
  body: ReportBody | null;
  nutrition: ReportNutrition | null;
  /** Most important first. The email shows the first two, the PDF all. */
  anomalies: Anomaly[];
  nextStep: NextStep;
};

const round = (n: number, dp = 1) => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

const periodOf = (date: string) => date.slice(0, 7);

/** The `n`th month before `period`. */
export const previousPeriod = (period: string, n = 1): string => {
  const [year, month] = period.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1 - n, 1));
  return d.toISOString().slice(0, 7);
};

/** The calendar month a run at `now` reports on: always the one that ended. */
export const reportPeriodFor = (now: Date): string =>
  previousPeriod(now.toISOString().slice(0, 7));

export const daysInPeriod = (period: string): number => {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** A reading far from those around it is a typo, not a body change: one that
 * sticks moves its neighbours too and stays in. Needs two neighbours to judge. */
export const dropImplausibleWeighIns = (
  entries: readonly WeighIn[],
): { kept: WeighIn[]; dropped: WeighIn[] } => {
  const kept: WeighIn[] = [];
  const dropped: WeighIn[] = [];
  entries.forEach((entry, i) => {
    const near = entries
      .filter(
        (other, j) =>
          j !== i &&
          Math.abs(daysBetween(other.date, entry.date)) <=
            WEIGH_IN_NEIGHBOUR_DAYS,
      )
      .map((other) => other.weightKg);
    const typical = near.length >= 2 ? median(near) : null;
    const off =
      typical !== null &&
      Math.abs(entry.weightKg - typical) / typical > IMPLAUSIBLE_WEIGH_IN;
    (off ? dropped : kept).push(entry);
  });
  return { kept, dropped };
};

/** The most a phase should move body weight per week, in % of body weight. */
const weightLimits = (
  phase: string | undefined,
): { down: number; up: number } => {
  if (phase === "cut") return { down: 1, up: 0.5 };
  if (phase === "bulk" || phase === "maintain" || phase === "recomp")
    return { down: 0.5, up: 0.5 };
  return { down: 1, up: 1 };
};

type LiftStat = { best: number; days: Set<string>; count: number };

const liftStats = (sets: readonly ReportSet[]): Map<string, LiftStat> => {
  const out = new Map<string, LiftStat>();
  for (const set of sets) {
    const e1rm = estimate1Rm(set.weightKg, set.reps);
    if (e1rm === null) continue;
    const stat = out.get(set.exerciseId) ?? {
      best: 0,
      days: new Set<string>(),
      count: 0,
    };
    stat.best = Math.max(stat.best, e1rm);
    stat.days.add(set.date);
    stat.count += 1;
    out.set(set.exerciseId, stat);
  }
  return out;
};

const REGULAR_DAYS = 2;
const MAIN_LIFTS = 5;
const TOP_GAINS = 3;
const TOP_STALLED = 2;

const strengthChanges = (
  current: readonly ReportSet[],
  previous: readonly ReportSet[],
) => {
  const now = liftStats(current);
  const before = liftStats(previous);
  const changes: (StrengthChange & { regular: boolean; count: number })[] = [];
  for (const [exerciseId, stat] of now) {
    const prior = before.get(exerciseId);
    if (!prior) continue;
    changes.push({
      exerciseId,
      fromKg: round(prior.best),
      toKg: round(stat.best),
      pct: round(((stat.best - prior.best) / prior.best) * 100),
      regular:
        stat.days.size >= REGULAR_DAYS && prior.days.size >= REGULAR_DAYS,
      count: stat.count,
    });
  }
  const strip = (c: (typeof changes)[number]): StrengthChange => ({
    exerciseId: c.exerciseId,
    fromKg: c.fromKg,
    toKg: c.toKg,
    pct: c.pct,
  });
  const mainLifts = new Set(
    [...changes]
      .sort((a, b) => b.count - a.count)
      .slice(0, MAIN_LIFTS)
      .map((c) => c.exerciseId),
  );
  const gains = changes
    .filter((c) => c.pct >= 1 && c.pct <= IMPLAUSIBLE_GAIN_PCT)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, TOP_GAINS)
    .map(strip);
  const stalled = changes
    .filter((c) => c.regular && Math.abs(c.pct) < 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_STALLED)
    .map(strip);
  const worst = changes
    .filter(
      (c) =>
        c.regular && mainLifts.has(c.exerciseId) && c.pct <= -STRENGTH_DROP_PCT,
    )
    .sort((a, b) => a.pct - b.pct)[0];
  return { gains, stalled, drop: worst ? strip(worst) : null };
};

/** The longest stretch without training that ended in or ran through the
 * month. A first-ever session has nothing before it, so it opens no gap. */
const longestGap = (
  dates: readonly string[],
  period: string,
  monthEnd: string,
): number | null => {
  const sorted = [...new Set(dates)].sort();
  const inMonth = sorted.filter((d) => periodOf(d) === period);
  if (inMonth.length === 0) return null;
  let longest = daysBetween(inMonth[inMonth.length - 1], monthEnd);
  sorted.forEach((date, i) => {
    if (i === 0 || periodOf(date) !== period) return;
    longest = Math.max(longest, daysBetween(sorted[i - 1], date));
  });
  return longest;
};

const buildBody = (input: ReportInput, days: number): ReportBody | null => {
  const { period } = input;
  const sorted = [...input.weighIns].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const { kept, dropped } = dropImplausibleWeighIns(sorted);
  const month = kept.filter((w) => periodOf(w.date) === period);
  const weeks = weeklyAverages(month, `${period}-01`, Math.ceil(days / 7));
  const withData = weeks.filter((w) => w.avgKg !== null);
  const first = withData[0];
  const last = withData[withData.length - 1];
  const hasTrend = withData.length >= 2;
  const startKg = first?.avgKg ?? null;
  const endKg = last?.avgKg ?? null;
  const deltaKg =
    hasTrend && startKg !== null && endKg !== null
      ? round(endKg - startKg, 2)
      : null;
  const weeklyRatePct =
    deltaKg !== null && startKg
      ? round((deltaKg / startKg / (last.index - first.index)) * 100, 2)
      : null;

  const readings = input.tape
    .filter((r) => r.site === input.keySite)
    .sort((a, b) => a.date.localeCompare(b.date));
  const inMonth = readings.filter((r) => periodOf(r.date) === period);
  const before = readings.filter((r) => periodOf(r.date) < period);
  const baseline = before[before.length - 1] ?? inMonth[0];
  const latest = inMonth[inMonth.length - 1];
  const keySiteDeltaCm =
    latest && baseline && baseline !== latest
      ? round(latest.cm - baseline.cm)
      : null;

  if (month.length === 0 && keySiteDeltaCm === null) return null;
  return {
    weighIns: month.length,
    excludedWeighIns: dropped.filter((w) => periodOf(w.date) === period).length,
    weeks: weeks.map((w) => ({ weekStart: w.weekStart, avgKg: w.avgKg })),
    startKg,
    endKg,
    deltaKg,
    weeklyRatePct,
    keySite: input.keySite,
    keySiteDeltaCm,
  };
};

const buildNutrition = (
  input: ReportInput,
  days: number,
): ReportNutrition | null => {
  const month = input.food.filter(
    (d) => periodOf(d.date) === input.period && d.kcal > 0,
  );
  if (month.length === 0) return null;
  const reliable = month.length >= days / 2;
  const average = (pick: (d: ReportFoodDay) => number) =>
    Math.round(month.reduce((sum, d) => sum + pick(d), 0) / month.length);
  return {
    daysLogged: month.length,
    reliable,
    avgKcal: reliable ? average((d) => d.kcal) : null,
    avgProteinG: reliable ? average((d) => d.proteinG) : null,
    targetKcal: input.goal?.targetKcal ?? null,
    targetProteinG: input.goal?.proteinG ?? null,
  };
};

export const buildMonthlyReport = (input: ReportInput): MonthlyReport => {
  const { period, index } = input;
  const days = daysInPeriod(period);
  const weeks = days / 7;
  const previous = previousPeriod(period);

  const setsIn = (p: string) =>
    input.sets.filter((s) => periodOf(s.date) === p);
  const sessionsIn = (p: string) =>
    input.sessions.filter((s) => periodOf(s.date) === p);

  const monthSets = setsIn(period);
  const monthSessions = sessionsIn(period);
  const previousSets = setsIn(previous);
  const previousCount = sessionsIn(previous).length;

  // Only months that had training count toward "usual": a month off must not
  // make an ordinary one look like a spike.
  const priorPeriods = [1, 2, 3]
    .map((n) => previousPeriod(period, n))
    .filter((p) => setsIn(p).length > 0);
  const priorSets = priorPeriods.flatMap(setsIn);
  const priorWeeks = priorPeriods.reduce(
    (sum, p) => sum + daysInPeriod(p) / 7,
    0,
  );
  const usualSetsPerWeek =
    priorWeeks > 0 ? round(priorSets.length / priorWeeks) : null;
  const setsPerWeek = round(monthSets.length / weeks);

  const priorTotals = fractionalSets(priorSets, index);
  const muscles: MuscleRow[] = muscleBalance(monthSets, index, weeks)
    .map((m) => ({
      head: m.head,
      setsPerWeek: m.sets,
      usualPerWeek:
        priorWeeks > 0 ? round(priorTotals[m.head] / priorWeeks) : null,
      status: m.status,
    }))
    .filter((m) => m.setsPerWeek > 0 || (m.usualPerWeek ?? 0) > 0)
    .sort((a, b) => b.setsPerWeek - a.setsPerWeek);

  const { gains, stalled, drop } = strengthChanges(monthSets, previousSets);
  const monthEnd = `${period}-${String(days).padStart(2, "0")}`;
  const longestGapDays = longestGap(
    input.sessions.map((s) => s.date),
    period,
    monthEnd,
  );
  const body = buildBody(input, days);
  const nutrition = buildNutrition(input, days);

  const anomalies: Anomaly[] = [];
  if (body?.weeklyRatePct != null) {
    const limits = weightLimits(input.goal?.phase);
    const rate = body.weeklyRatePct;
    if (rate <= -limits.down)
      anomalies.push({
        id: "weight_fast",
        direction: "down",
        ratePct: Math.abs(rate),
      });
    else if (rate >= limits.up)
      anomalies.push({ id: "weight_fast", direction: "up", ratePct: rate });
  }
  if (longestGapDays !== null && longestGapDays >= LONG_GAP_DAYS)
    anomalies.push({ id: "training_gap", days: longestGapDays });
  if (drop)
    anomalies.push({
      id: "strength_drop",
      exerciseId: drop.exerciseId,
      pct: Math.abs(drop.pct),
    });
  if (
    priorPeriods.length >= 2 &&
    usualSetsPerWeek &&
    setsPerWeek > usualSetsPerWeek * VOLUME_SPIKE_RATIO
  )
    anomalies.push({
      id: "volume_spike",
      pct: Math.round((setsPerWeek / usualSetsPerWeek - 1) * 100),
    });
  // A muscle only "lost" work if the rest of training held up; otherwise the
  // long-gap or lighter-month reading already says it.
  const trainingHeld =
    usualSetsPerWeek !== null &&
    setsPerWeek >= usualSetsPerWeek * TRAINING_HELD_RATIO;
  if (trainingHeld) {
    const dropped = muscles
      .filter(
        (m) =>
          MAJOR_MUSCLES.includes(m.head) &&
          m.usualPerWeek !== null &&
          m.usualPerWeek >= MUSCLE_USUAL_MIN_SETS &&
          m.setsPerWeek < m.usualPerWeek * MUSCLE_DROP_RATIO,
      )
      .sort(
        (a, b) =>
          a.setsPerWeek / (a.usualPerWeek ?? 1) -
          b.setsPerWeek / (b.usualPerWeek ?? 1),
      )[0];
    if (dropped?.usualPerWeek != null)
      anomalies.push({
        id: "muscle_drop",
        head: dropped.head,
        setsPerWeek: dropped.setsPerWeek,
        usualPerWeek: dropped.usualPerWeek,
      });
  }

  const verdict = ((): Verdict => {
    if (monthSessions.length === 0) return "tracking";
    if (previousCount === 0) return "first";
    const ratio = monthSessions.length / previousCount;
    if (ratio < 0.7) return "down";
    return ratio >= 1 && gains.length > 0 && !drop ? "strong" : "steady";
  })();

  const nextStep = ((): NextStep => {
    if (anomalies[0]) return STEP_FOR_ANOMALY[anomalies[0].id];
    if (!body || body.weighIns < MIN_WEIGH_INS) return "weigh_in";
    if (nutrition && !nutrition.reliable) return "log_food";
    return "keep_progressing";
  })();

  return {
    period,
    daysInMonth: days,
    verdict,
    training: {
      sessions: monthSessions.length,
      prevSessions: previousCount > 0 ? previousCount : null,
      perWeek: round(monthSessions.length / weeks),
      minutes: Math.round(
        monthSessions.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0) /
          60,
      ),
      skippedDays: input.skippedDays.filter((d) => periodOf(d) === period)
        .length,
      longestGapDays,
      workingSets: monthSets.length,
      prevWorkingSets: previousSets.length > 0 ? previousSets.length : null,
      setsPerWeek,
      usualSetsPerWeek,
    },
    strength: { gains, stalled },
    muscles,
    body,
    nutrition,
    anomalies,
    nextStep,
  };
};

/** Whether a month holds enough to be worth a report at all. Anything less
 * gets the tips edition instead: nobody on the list is sent an empty report. */
export const hasEnoughData = (report: MonthlyReport): boolean =>
  report.training.sessions >= MIN_SESSIONS ||
  (report.body?.weighIns ?? 0) >= MIN_WEIGH_INS ||
  (report.nutrition?.daysLogged ?? 0) >= MIN_FOOD_DAYS;
