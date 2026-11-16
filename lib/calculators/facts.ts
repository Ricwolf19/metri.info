import {
  type ActivityLevel,
  type BmrFormula,
  bmr,
  type Sex,
  tdee,
} from "@/lib/calculations";

import { ACTIVITY_LEVELS, SEXES } from "@/lib/account/options";

import { type CalcFacts, type FactKey, PREFILL } from "./prefill";
import type { CalcId } from "./types";

/**
 * Server-side half of calculator prefill: merges a user's profile, their
 * latest synced readings and their saved calculations into `CalcFacts`.
 * Pure, so the precedence rules are tested without a database.
 */

/** The profile's stored formula ids (the app's) → the calculator's. */
const FORMULA_FROM_PROFILE: Record<string, BmrFormula> = {
  mifflin_st_jeor: "mifflin",
  harris_benedict: "harris",
  katch_mcardle: "katch",
};

/** App phases that mean the same as a calculator goal (`recomp` has no
 * calculator equivalent, so it seeds nothing). */
const GOAL_FROM_PHASE: Record<string, string> = {
  cut: "cut",
  maintain: "maintain",
  bulk: "bulk",
};

export type SavedCalc = {
  calculatorType: string;
  inputs: unknown;
  createdAt: Date;
};

export type ProfileFacts = {
  sex: string | null;
  age: number | null;
  bodyWeightKg: number | null;
  bodyHeightCm: number | null;
  bodyFatPct: number | null;
  activityLevel: string | null;
  bmrFormula: string | null;
  latestTdee: number | null;
  unitsPreference: string;
};

export type LogFacts = {
  weightKg: number | null;
  bodyFatPct: number | null;
  tape: { waist?: number; neck?: number; hips?: number };
  goal: {
    phase: string;
    startWeightKg: number | null;
    rateKgPerWeek: number | null;
    durationWeeks: number | null;
    tdeeAtStart: number | null;
  } | null;
};

const YEAR_MS = 365.25 * 86_400_000;

/** A value from one of the known sets, or null: profile rows and saved
 * calculation inputs are both untrusted (`unset`, legacy values, junk). */
const oneOf = (
  values: readonly string[],
  v: string | number | null | undefined,
): string | null => (typeof v === "string" && values.includes(v) ? v : null);

const BMR_FORMULAS: readonly BmrFormula[] = ["mifflin", "harris", "katch"];
const GOALS = Object.values(GOAL_FROM_PHASE);

/** Maintenance outside this range is a typo upstream, not a person. */
const MAINTENANCE_RANGE = { min: 1000, max: 6000 } as const;

/**
 * The newest value of each fact across the user's saved calculations, read
 * back through `PREFILL` (a saved TDEE's `age` IS their age). An age saved a
 * while ago is aged forward.
 */
const factsFromSaved = (saved: SavedCalc[], now: Date) => {
  const out: Partial<Record<FactKey, number | string>> = {};
  const newestFirst = [...saved].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  for (const calc of newestFirst) {
    const map = PREFILL[calc.calculatorType as CalcId];
    if (!map || typeof calc.inputs !== "object" || calc.inputs === null)
      continue;
    const inputs = calc.inputs as Record<string, unknown>;
    for (const [field, key] of Object.entries(map)) {
      const v = inputs[field];
      if (out[key] !== undefined) continue;
      if (typeof v === "number" && Number.isFinite(v)) {
        out[key] =
          key === "age"
            ? v +
              Math.floor((now.getTime() - calc.createdAt.getTime()) / YEAR_MS)
            : v;
      } else if (typeof v === "string" && v) out[key] = v;
    }
  }
  return out;
};

const asNum = (v: number | string | undefined) =>
  typeof v === "number" ? v : null;

const plausibleKcal = (kcal: number | null) =>
  kcal !== null &&
  Number.isFinite(kcal) &&
  kcal >= MAINTENANCE_RANGE.min &&
  kcal <= MAINTENANCE_RANGE.max
    ? kcal
    : null;

/** Maintenance from the facts themselves, when they're complete. */
const estimateMaintenance = (f: CalcFacts): number | null => {
  if (!f.sex || !f.activity || !f.weightKg || !f.heightCm) return null;
  const formula = (f.bmrFormula ?? "mifflin") as BmrFormula;
  if (formula !== "katch" && !f.age) return null;
  if (formula === "katch" && !f.bodyFatPct) return null;
  const b = bmr(formula, {
    sex: f.sex as Sex,
    weightKg: f.weightKg,
    heightCm: f.heightCm,
    age: f.age ?? 0,
    bodyFatPct: f.bodyFatPct ?? 0,
  });
  return b > 0 ? Math.round(tdee(b, f.activity as ActivityLevel)) : null;
};

/**
 * Merge the three sources, freshest kind first: a dated reading the phone
 * logged beats the profile (set once, often long ago), and the profile beats
 * whatever the user typed into a calculator last time.
 */
export const buildCalcFacts = ({
  profile,
  logs,
  saved,
  now,
}: {
  profile: ProfileFacts | null;
  logs: LogFacts;
  saved: SavedCalc[];
  now: Date;
}): CalcFacts => {
  const s = factsFromSaved(saved, now);
  const goal = logs.goal;
  const phase = goal ? (GOAL_FROM_PHASE[goal.phase] ?? null) : null;
  const target =
    goal?.phase === "cut" &&
    goal.startWeightKg &&
    goal.rateKgPerWeek &&
    goal.durationWeeks
      ? goal.startWeightKg - Math.abs(goal.rateKgPerWeek) * goal.durationWeeks
      : null;

  const facts: CalcFacts = {
    sex: oneOf(SEXES, profile?.sex) ?? oneOf(SEXES, s.sex),
    age: profile?.age ?? asNum(s.age),
    heightCm: profile?.bodyHeightCm ?? asNum(s.heightCm),
    weightKg: logs.weightKg ?? profile?.bodyWeightKg ?? asNum(s.weightKg),
    bodyFatPct: logs.bodyFatPct ?? profile?.bodyFatPct ?? asNum(s.bodyFatPct),
    activity:
      oneOf(ACTIVITY_LEVELS, profile?.activityLevel) ??
      oneOf(ACTIVITY_LEVELS, s.activity),
    bmrFormula:
      FORMULA_FROM_PROFILE[profile?.bmrFormula ?? ""] ??
      oneOf(BMR_FORMULAS, s.bmrFormula),
    maintenanceKcal: null,
    restingHr: asNum(s.restingHr),
    waistCm: logs.tape.waist ?? asNum(s.waistCm),
    neckCm: logs.tape.neck ?? asNum(s.neckCm),
    hipsCm: logs.tape.hips ?? asNum(s.hipsCm),
    goal: phase ?? oneOf(GOALS, s.goal),
    targetWeightKg: target ?? asNum(s.targetWeightKg),
    rateKgPerWeek:
      goal?.phase === "cut" && goal.rateKgPerWeek
        ? Math.abs(goal.rateKgPerWeek)
        : asNum(s.rateKgPerWeek),
    unitsPreference: profile?.unitsPreference ?? "kg",
  };
  facts.maintenanceKcal = plausibleKcal(
    profile?.latestTdee ??
      goal?.tdeeAtStart ??
      estimateMaintenance(facts) ??
      asNum(s.maintenanceKcal),
  );
  return facts;
};
