import type { CalcFacts } from "@/lib/calculators/prefill";
import {
  type Answers,
  DIET_HISTORY,
  EXPERIENCE,
  GOALS,
  parseAnswers,
  type QuestionId,
  SLEEP,
  TRACKING,
  TRAINING_NOW,
  WEIGHT_RANGE,
} from "@/lib/roadmap/diagnostic";

/**
 * The diagnostic's form model: values as inputs hold them (strings), what
 * each question validates, how a radio question renders, and the mapping to
 * and from the stored `Answers`.
 */

const LB_PER_KG = 2.2046226218;

export type DiagnosticValues = {
  goal: string;
  sex: string;
  bodyFatMode: "known" | "estimate";
  bodyFatPct: string;
  bodyFatBand: string;
  weight: string;
  experience: string;
  trainingNow: string;
  tracking: string;
  sleep: string;
  dietHistory: string;
  caution: string;
};

/** Which form fields each question owns, validated before moving on. */
export const QUESTION_FIELDS: Record<QuestionId, (keyof DiagnosticValues)[]> = {
  goal: ["goal"],
  sex: ["sex"],
  bodyFat: ["bodyFatPct", "bodyFatBand"],
  weight: ["weight"],
  experience: ["experience"],
  trainingNow: ["trainingNow"],
  tracking: ["tracking"],
  sleep: ["sleep"],
  dietHistory: ["dietHistory"],
  caution: ["caution"],
};

type RadioQuestion = {
  values: readonly string[];
  /** Each option has a `.desc` line. */
  described?: boolean;
  /** The question has a `.hint` line under its title. */
  hint?: boolean;
  /** Two short options side by side from `sm` up. */
  columns?: boolean;
};

/** The questions that are one pick from a list; copy keys follow
 * `roadmap.q.<id>.<value>`. */
export const RADIO_QUESTIONS: Partial<
  Record<QuestionId, RadioQuestion & { field: keyof DiagnosticValues }>
> = {
  goal: { field: "goal", values: GOALS, described: true },
  sex: { field: "sex", values: ["male", "female"], hint: true, columns: true },
  experience: { field: "experience", values: EXPERIENCE },
  trainingNow: { field: "trainingNow", values: TRAINING_NOW },
  tracking: { field: "tracking", values: TRACKING },
  sleep: { field: "sleep", values: SLEEP },
  dietHistory: { field: "dietHistory", values: DIET_HISTORY },
  caution: {
    field: "caution",
    values: ["no", "yes"],
    hint: true,
    columns: true,
  },
};

const GOAL_FROM_FACT: Record<string, string> = {
  cut: "lose_fat",
  bulk: "build_muscle",
  maintain: "maintain",
};

export const parseNum = (s: string) => (s.trim() === "" ? null : Number(s));
const round1 = (n: number) => Math.round(n * 10) / 10;

/** The weight bounds in the unit the person types. */
export const weightBounds = (imperial: boolean) => ({
  min: Math.ceil(imperial ? WEIGHT_RANGE.min * LB_PER_KG : WEIGHT_RANGE.min),
  max: Math.floor(imperial ? WEIGHT_RANGE.max * LB_PER_KG : WEIGHT_RANGE.max),
  unit: imperial ? "lb" : "kg",
});

/** Previous answers when retaking, else what the account knows. */
export const toFormValues = (
  previous: Answers | null,
  facts: CalcFacts | null,
  imperial: boolean,
): DiagnosticValues => {
  const weightKg = previous?.weightKg ?? facts?.weightKg ?? null;
  const bodyFatPct = previous ? previous.bodyFatPct : facts?.bodyFatPct;
  return {
    goal: previous?.goal ?? GOAL_FROM_FACT[facts?.goal ?? ""] ?? "",
    sex: previous?.sex ?? facts?.sex ?? "",
    bodyFatMode: bodyFatPct ? "known" : "estimate",
    bodyFatPct: bodyFatPct ? String(round1(bodyFatPct)) : "",
    bodyFatBand: previous?.bodyFatBand ?? "",
    weight: weightKg
      ? String(round1(imperial ? weightKg * LB_PER_KG : weightKg))
      : "",
    experience: previous?.experience ?? "",
    trainingNow: previous?.trainingNow ?? "",
    tracking: previous?.tracking ?? "",
    sleep: previous?.sleep ?? "",
    dietHistory: previous?.dietHistory ?? "",
    caution: previous ? (previous.caution ? "yes" : "no") : "",
  };
};

export const toAnswers = (
  v: DiagnosticValues,
  imperial: boolean,
): Answers | null => {
  const weight = parseNum(v.weight);
  return parseAnswers({
    ...v,
    bodyFatPct: v.bodyFatMode === "known" ? parseNum(v.bodyFatPct) : null,
    bodyFatBand: v.bodyFatMode === "estimate" ? v.bodyFatBand : null,
    weightKg: weight === null ? null : imperial ? weight / LB_PER_KG : weight,
    caution: v.caution === "yes",
  });
};
