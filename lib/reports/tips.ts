import type { TranslationKey } from "@/lib/i18n/en";
import { CALC_IDS, type CalcRouteId } from "@/lib/i18n/routes";
import type { QuizArea } from "@/lib/quiz/areas";
import { studyPlan } from "@/lib/quiz/recommend";
import type { QuizScores } from "@/lib/quiz/scores";

/**
 * The tips edition of the monthly email: what goes out instead of a report
 * when an account has nothing to report on (no app yet, a free account, or a
 * quiet month). Built from what the site itself knows about the account: saved
 * calculations and knowledge-check results. Every tip restates a guide in
 * `content/docs`, so it can only say what the knowledge base already says.
 */

export type Tip = {
  title: TranslationKey;
  body: TranslationKey;
  guide: string;
};

const TIPS: readonly Tip[] = [
  {
    title: "monthlyTips.overload.title",
    body: "monthlyTips.overload.body",
    guide: "progressive-overload",
  },
  {
    title: "monthlyTips.volume.title",
    body: "monthlyTips.volume.body",
    guide: "volume-frequency",
  },
  {
    title: "monthlyTips.intensity.title",
    body: "monthlyTips.intensity.body",
    guide: "training-intensity",
  },
  {
    title: "monthlyTips.measuring.title",
    body: "monthlyTips.measuring.body",
    guide: "measuring-progress",
  },
  {
    title: "monthlyTips.protein.title",
    body: "monthlyTips.protein.body",
    guide: "macros",
  },
  {
    title: "monthlyTips.tdee.title",
    body: "monthlyTips.tdee.body",
    guide: "tdee",
  },
  {
    title: "monthlyTips.sleep.title",
    body: "monthlyTips.sleep.body",
    guide: "sleep",
  },
  {
    title: "monthlyTips.technique.title",
    body: "monthlyTips.technique.body",
    guide: "lifting-technique",
  },
  {
    title: "monthlyTips.diet.title",
    body: "monthlyTips.diet.body",
    guide: "personalizing-your-diet",
  },
];

const TIPS_PER_EMAIL = 3;
/** Coprime with the bank's size and past `TIPS_PER_EMAIL`: consecutive months
 * never share a tip, and every tip gets its turn. */
const MONTHLY_STEP = 4;

/** Which tips a month gets. A function of the month alone, so a retried run
 * sends the same ones. */
export const pickTips = (period: string): Tip[] => {
  const [year, month] = period.split("-").map(Number);
  const start = ((year * 12 + month) * MONTHLY_STEP) % TIPS.length;
  return Array.from(
    { length: TIPS_PER_EMAIL },
    (_, i) => TIPS[(start + i) % TIPS.length],
  );
};

/** The one guide that best opens each knowledge-check area. */
const AREA_GUIDE: Record<QuizArea, string> = {
  nutrition: "macros",
  training: "progressive-overload",
  body: "measuring-progress",
  fundamentals: "glossary",
};

const DEFAULT_CALCULATOR: CalcRouteId = "tdee";

/** The natural next tool after the one an account uses most. */
const NEXT_CALCULATOR: Partial<Record<CalcRouteId, CalcRouteId>> = {
  tdee: "macros",
  macros: "protein",
  protein: "macros",
  deficit: "macros",
  onerm: "plates",
  plates: "onerm",
  bodyfat: "ffmi",
  ffmi: "bodyfat",
  bmi: "bodyfat",
  leanmass: "ffmi",
  idealweight: "bodyfat",
  whtr: "bodyfat",
  wilks: "onerm",
  water: "tdee",
};

export type TipsReason = "no_data" | "quiet_month";

export type TipsSignals = {
  reason: TipsReason;
  /** Calculations saved in the month. */
  calculations: number;
  /** The month's most-saved calculator, as stored (`calculator_type`). */
  topCalculator: string | null;
  /** Latest knowledge-check result, null when never taken. */
  quizScores: QuizScores | null;
  latestVersion: string | null;
};

type KnowledgeNudge =
  | { kind: "take" }
  | { kind: "study"; area: QuizArea; guide: string };

export type TipsEdition = {
  reason: TipsReason;
  tips: Tip[];
  calculations: number;
  topCalculator: CalcRouteId | null;
  /** Null when every area is already fully cleared. */
  knowledge: KnowledgeNudge | null;
  calculator: CalcRouteId;
  latestVersion: string | null;
};

const asCalculator = (value: string | null): CalcRouteId | null =>
  CALC_IDS.find((id) => id === value) ?? null;

export const buildTipsEdition = (
  period: string,
  signals: TipsSignals,
): TipsEdition => {
  const topCalculator = asCalculator(signals.topCalculator);
  const weakest = signals.quizScores ? studyPlan(signals.quizScores)[0] : null;
  const knowledge: KnowledgeNudge | null = !signals.quizScores
    ? { kind: "take" }
    : weakest
      ? { kind: "study", area: weakest.area, guide: AREA_GUIDE[weakest.area] }
      : null;
  return {
    reason: signals.reason,
    tips: pickTips(period),
    calculations: signals.calculations,
    topCalculator,
    knowledge,
    calculator: topCalculator
      ? (NEXT_CALCULATOR[topCalculator] ?? DEFAULT_CALCULATOR)
      : DEFAULT_CALCULATOR,
    latestVersion: signals.latestVersion,
  };
};
