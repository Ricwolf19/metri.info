/**
 * Pure calculation logic — ported 1:1 from the METRI mobile app. No framework
 * or i18n deps so it can be shared/tested anywhere. All inputs metric
 * (kg, cm, years); callers handle units and labels.
 */

export type Sex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const round = (n: number, dp = 1) => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

/* ── 1RM ────────────────────────────────────────────────────────────────── */

export type OneRmFormula = "epley" | "brzycki";

export const oneRm = (
  weight: number,
  reps: number,
  formula: OneRmFormula,
): number => {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return round(weight);
  const value =
    formula === "brzycki"
      ? (weight * 36) / (37 - reps)
      : weight * (1 + reps / 30);
  return round(value);
};

/** Common training percentages of 1RM → estimated reps. */
export const RM_PERCENTAGES: { pct: number; reps: number }[] = [
  { pct: 100, reps: 1 },
  { pct: 95, reps: 2 },
  { pct: 90, reps: 4 },
  { pct: 85, reps: 6 },
  { pct: 80, reps: 8 },
  { pct: 75, reps: 10 },
  { pct: 70, reps: 12 },
];

/* ── BMR / TDEE ─────────────────────────────────────────────────────────── */

export type BmrFormula = "harris" | "mifflin" | "katch";

export const bmr = (
  formula: BmrFormula,
  {
    sex,
    weightKg,
    heightCm,
    age,
    bodyFatPct,
  }: {
    sex: Sex;
    weightKg: number;
    heightCm: number;
    age: number;
    bodyFatPct?: number;
  },
): number => {
  if (formula === "mifflin") {
    return round(
      10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161),
      0,
    );
  }
  if (formula === "katch") {
    const lbm = weightKg * (1 - (bodyFatPct ?? 0) / 100);
    return round(370 + 21.6 * lbm, 0);
  }
  // Harris–Benedict (Roza & Shizgal)
  return sex === "male"
    ? round(88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age, 0)
    : round(447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age, 0);
};

export const tdee = (bmrValue: number, activity: ActivityLevel): number =>
  round(bmrValue * ACTIVITY_MULTIPLIERS[activity], 0);

/* ── Macros ─────────────────────────────────────────────────────────────── */

export type Goal = "cut" | "maintain" | "bulk";

const PROTEIN_PER_KG: Record<Goal, number> = {
  cut: 2.2,
  maintain: 2.0,
  bulk: 1.8,
};

export const macros = (calories: number, weightKg: number, goal: Goal) => {
  const protein = round(PROTEIN_PER_KG[goal] * weightKg, 0);
  const proteinKcal = protein * 4;
  const fatKcal = calories * 0.25;
  const fat = round(fatKcal / 9, 0);
  const carbsKcal = Math.max(0, calories - proteinKcal - fatKcal);
  const carbs = round(carbsKcal / 4, 0);
  return { protein, fat, carbs };
};

/* ── Body fat (U.S. Navy) ───────────────────────────────────────────────── */

export const bodyFatNavy = ({
  sex,
  heightCm,
  neckCm,
  waistCm,
  hipCm,
}: {
  sex: Sex;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
}): number => {
  const log10 = Math.log10;
  const value =
    sex === "male"
      ? 495 /
          (1.0324 -
            0.19077 * log10(waistCm - neckCm) +
            0.15456 * log10(heightCm)) -
        450
      : 495 /
          (1.29579 -
            0.35004 * log10(waistCm + (hipCm ?? 0) - neckCm) +
            0.221 * log10(heightCm)) -
        450;
  return value > 0 && Number.isFinite(value) ? round(value) : 0;
};

export const bodyFatCategory = (bf: number, sex: Sex): string => {
  const t =
    sex === "male"
      ? { essential: 6, athlete: 14, fitness: 18, average: 25 }
      : { essential: 14, athlete: 21, fitness: 25, average: 32 };
  if (bf < t.essential) return "essential";
  if (bf < t.athlete) return "athlete";
  if (bf < t.fitness) return "fitness";
  if (bf < t.average) return "average";
  return "high";
};

/* ── BMI / healthy weight ───────────────────────────────────────────────── */

export const bmi = (weightKg: number, heightCm: number): number => {
  const m = heightCm / 100;
  if (m <= 0) return 0;
  return round(weightKg / (m * m));
};

export const bmiCategory = (value: number): string => {
  if (value < 18.5) return "underweight";
  if (value < 25) return "normal";
  if (value < 30) return "overweight";
  return "obese";
};

/** Healthy weight range (kg) for BMI 18.5–24.9. */
export const healthyWeightRange = (heightCm: number) => {
  const m = heightCm / 100;
  return { min: round(18.5 * m * m), max: round(24.9 * m * m) };
};

/* ── FFMI ───────────────────────────────────────────────────────────────── */

export const ffmi = ({
  weightKg,
  heightCm,
  bodyFatPct,
}: {
  weightKg: number;
  heightCm: number;
  bodyFatPct: number;
}) => {
  const m = heightCm / 100;
  if (m <= 0) return { raw: 0, normalized: 0 };
  const fatFree = weightKg * (1 - bodyFatPct / 100);
  const raw = fatFree / (m * m);
  const normalized = raw + 6.1 * (1.8 - m);
  return { raw: round(raw), normalized: round(normalized) };
};

export const ffmiBand = (normalized: number): string => {
  if (normalized < 18) return "below";
  if (normalized < 20) return "average";
  if (normalized < 22) return "aboveAverage";
  if (normalized < 23) return "excellent";
  if (normalized < 26) return "superior";
  return "suspicious";
};

/* ── Hydration ──────────────────────────────────────────────────────────── */

const ACTIVITY_WATER_BONUS: Record<ActivityLevel, number> = {
  sedentary: 0,
  light: 250,
  moderate: 500,
  active: 750,
  very_active: 1000,
};

export const hydration = (weightKg: number, activity: ActivityLevel) => {
  const ml = weightKg * 35 + ACTIVITY_WATER_BONUS[activity];
  return {
    ml: Math.round(ml),
    liters: round(ml / 1000),
    cups: Math.round(ml / 240),
  };
};

/* ── Plate loading ──────────────────────────────────────────────────────── */

export const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];

export const plateLoad = (targetKg: number, barKg = 20) => {
  const perSide = (targetKg - barKg) / 2;
  const result: { plate: number; count: number }[] = [];
  let remaining = perSide;
  if (perSide > 0) {
    for (const plate of PLATES_KG) {
      const count = Math.floor(remaining / plate + 1e-9);
      if (count > 0) {
        result.push({ plate, count });
        remaining -= plate * count;
      }
    }
  }
  return {
    perSide: round(Math.max(0, perSide)),
    plates: result,
    remainder: round(Math.max(0, remaining)),
  };
};
