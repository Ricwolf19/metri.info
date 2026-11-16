import { SEXES } from "@/lib/account/options";

/**
 * The roadmap's diagnostic: a short intake whose answers decide the phase
 * (`recommend.ts`) and which steps the roadmap includes (`steps.ts`). The
 * value sets are a stored format (localStorage and the `roadmap` row), so
 * add values, never rename them.
 */

export const GOALS = [
  "lose_fat",
  "build_muscle",
  "both",
  "maintain",
  "unsure",
] as const;
/** none: never lifted · beginner: under a year · intermediate: 1–3 years ·
 * advanced: 3+ years of consistent training. */
export const EXPERIENCE = [
  "none",
  "beginner",
  "intermediate",
  "advanced",
] as const;
export const TRAINING_NOW = ["none", "irregular", "consistent"] as const;
export const TRACKING = ["never", "sometimes", "now"] as const;
export const SLEEP = ["under6", "six_seven", "seven_plus"] as const;
/** long: in a deficit for 12+ weeks without a break. */
export const DIET_HISTORY = ["none", "short", "long"] as const;
/** A visual estimate for people who don't know their number; each band maps
 * to a representative % per sex (`BAND_PCT`). */
export const BODY_FAT_BANDS = [
  "lean",
  "athletic",
  "average",
  "above",
  "high",
] as const;

type Goal = (typeof GOALS)[number];
type Experience = (typeof EXPERIENCE)[number];
type TrainingNow = (typeof TRAINING_NOW)[number];
type Tracking = (typeof TRACKING)[number];
type Sleep = (typeof SLEEP)[number];
type DietHistory = (typeof DIET_HISTORY)[number];
export type BodyFatBand = (typeof BODY_FAT_BANDS)[number];
export type Sex = (typeof SEXES)[number];

export type Answers = {
  goal: Goal;
  sex: Sex;
  /** A known body-fat %, or null to use `bodyFatBand`. */
  bodyFatPct: number | null;
  bodyFatBand: BodyFatBand | null;
  /** Optional: turns rates into kilograms and calories. */
  weightKg: number | null;
  experience: Experience;
  trainingNow: TrainingNow;
  tracking: Tracking;
  sleep: Sleep;
  dietHistory: DietHistory;
  /** A medical condition, pregnancy, under 18 or a history of disordered
   * eating: the plan stays conservative and says to see a professional. */
  caution: boolean;
};

/** The questions in the order the intake asks them. */
export const QUESTIONS = [
  "goal",
  "sex",
  "bodyFat",
  "weight",
  "experience",
  "trainingNow",
  "tracking",
  "sleep",
  "dietHistory",
  "caution",
] as const;
export type QuestionId = (typeof QUESTIONS)[number];

export const BODY_FAT_RANGE = { min: 3, max: 60 } as const;
export const WEIGHT_RANGE = { min: 30, max: 300 } as const;

/** Representative body fat of each band (men's and women's scales differ by
 * about eight points: essential fat is higher for women). */
const BAND_PCT: Record<Sex, Record<BodyFatBand, number>> = {
  male: { lean: 10, athletic: 13.5, average: 17.5, above: 22.5, high: 28 },
  female: { lean: 18, athletic: 21.5, average: 25.5, above: 30, high: 36 },
};

/** The band ranges shown next to each choice, per sex. */
export const BAND_RANGE: Record<Sex, Record<BodyFatBand, string>> = {
  male: {
    lean: "< 12%",
    athletic: "12–15%",
    average: "15–20%",
    above: "20–25%",
    high: "25%+",
  },
  female: {
    lean: "< 20%",
    athletic: "20–23%",
    average: "23–28%",
    above: "28–33%",
    high: "33%+",
  },
};

/** The body fat the plan reasons with: the known number, else the band's. */
export const bodyFatOf = (a: Answers): number =>
  a.bodyFatPct ?? BAND_PCT[a.sex][a.bodyFatBand ?? "average"];

const oneOf = <T extends string>(values: readonly T[], v: unknown): T | null =>
  typeof v === "string" && (values as readonly string[]).includes(v)
    ? (v as T)
    : null;

const inRange = (
  v: unknown,
  { min, max }: { min: number; max: number },
): number | null =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max
    ? Math.round(v * 10) / 10
    : null;

/** Answers from untrusted JSON (localStorage, a server action), or null when
 * anything required is missing or out of its set. */
export const parseAnswers = (raw: unknown): Answers | null => {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const goal = oneOf(GOALS, r.goal);
  const sex = oneOf(SEXES, r.sex);
  const experience = oneOf(EXPERIENCE, r.experience);
  const trainingNow = oneOf(TRAINING_NOW, r.trainingNow);
  const tracking = oneOf(TRACKING, r.tracking);
  const sleep = oneOf(SLEEP, r.sleep);
  const dietHistory = oneOf(DIET_HISTORY, r.dietHistory);
  const bodyFatPct = inRange(r.bodyFatPct, BODY_FAT_RANGE);
  const bodyFatBand = oneOf(BODY_FAT_BANDS, r.bodyFatBand);
  if (
    !goal ||
    !sex ||
    !experience ||
    !trainingNow ||
    !tracking ||
    !sleep ||
    !dietHistory ||
    (bodyFatPct === null && bodyFatBand === null) ||
    typeof r.caution !== "boolean"
  )
    return null;
  return {
    goal,
    sex,
    bodyFatPct,
    bodyFatBand: bodyFatPct === null ? bodyFatBand : null,
    weightKg: inRange(r.weightKg, WEIGHT_RANGE),
    experience,
    trainingNow,
    tracking,
    sleep,
    dietHistory,
    caution: r.caution,
  };
};
