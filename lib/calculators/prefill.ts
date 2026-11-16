import type { CalcConfig, CalcId, CalcValues } from "./types";

/**
 * What we know about a signed-in user, in calculator units (kg, cm, %, kcal,
 * years), assembled server-side by `getCalcFacts` from their profile, the
 * latest readings the phone synced and their own saved calculations. Every
 * fact is null when unknown.
 */
export type CalcFacts = {
  sex: string | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  bodyFatPct: number | null;
  activity: string | null;
  /** Calculator formula id (`mifflin` | `harris` | `katch`). */
  bmrFormula: string | null;
  maintenanceKcal: number | null;
  restingHr: number | null;
  waistCm: number | null;
  neckCm: number | null;
  hipsCm: number | null;
  /** The phone's active phase, when it maps onto a calculator goal. */
  goal: string | null;
  targetWeightKg: number | null;
  rateKgPerWeek: number | null;
  unitsPreference: string;
};

export type FactKey = Exclude<keyof CalcFacts, "unitsPreference">;

/**
 * Which fact seeds which input, per calculator. Centralised so it's easy to
 * audit what a field means: a calculator's `weight` maps to body weight only
 * when that's what it is. 1RM/plate `weight`/`target` are *lifted* loads and
 * `calsburned.activity` is an exercise, so they're deliberately absent.
 */
export const PREFILL: Partial<Record<CalcId, Record<string, FactKey>>> = {
  tdee: {
    sex: "sex",
    age: "age",
    height: "heightCm",
    weight: "weightKg",
    bodyFat: "bodyFatPct",
    activity: "activity",
    formula: "bmrFormula",
  },
  macros: {
    calories: "maintenanceKcal",
    weight: "weightKg",
    goal: "goal",
    bodyFat: "bodyFatPct",
  },
  deficit: {
    current: "weightKg",
    goal: "targetWeightKg",
    rate: "rateKgPerWeek",
  },
  protein: { weight: "weightKg", goal: "goal" },
  calsburned: { weight: "weightKg" },
  bodyfat: {
    sex: "sex",
    height: "heightCm",
    neck: "neckCm",
    waist: "waistCm",
    hip: "hipsCm",
  },
  bmi: { height: "heightCm", weight: "weightKg" },
  ffmi: { weight: "weightKg", height: "heightCm", bodyFat: "bodyFatPct" },
  idealweight: { sex: "sex", height: "heightCm" },
  leanmass: {
    sex: "sex",
    weight: "weightKg",
    height: "heightCm",
    bodyFat: "bodyFatPct",
  },
  whtr: { waist: "waistCm", height: "heightCm" },
  water: { weight: "weightKg", activity: "activity" },
  heartrate: { age: "age", resting: "restingHr" },
  wilks: { sex: "sex", bodyweight: "weightKg" },
};

/** Round to the field's step without float dust (85.3, not 85.30000000001). */
const snap = (value: number, step: number) => {
  const decimals = (String(step).split(".")[1] ?? "").length;
  return Number((Math.round(value / step) * step).toFixed(decimals));
};

/** Seed `values` (metric base units) from the user's facts. A fact only lands
 * when the field would accept it — inside its range, or one of its options —
 * so a prefill never opens a calculator on an error. */
export const applyFactsToValues = (
  config: CalcConfig,
  values: CalcValues,
  facts: CalcFacts,
): { values: CalcValues; changed: boolean } => {
  const map = PREFILL[config.id];
  if (!map) return { values, changed: false };

  const next = { ...values };
  let changed = false;
  for (const field of config.fields) {
    const key = map[field.name];
    const fact = key ? facts[key] : null;
    if (fact === null || fact === undefined) continue;
    const fits =
      field.kind === "select"
        ? field.options.some((o) => o.value === fact)
        : typeof fact === "number" &&
          Number.isFinite(fact) &&
          (field.min === undefined || fact >= field.min) &&
          (field.max === undefined || fact <= field.max);
    if (!fits || next[field.name] === fact) continue;
    next[field.name] =
      typeof fact === "number" && field.kind === "number" && field.step
        ? snap(fact, field.step)
        : fact;
    changed = true;
  }
  return { values: next, changed };
};
