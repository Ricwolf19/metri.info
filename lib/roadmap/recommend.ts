import { type Answers, bodyFatOf, type Sex } from "./diagnostic";

/**
 * Which phase to run, how fast and for how long, from the diagnostic. The
 * thresholds are the knowledge base's (`choosing-your-phase`, the same tables
 * as the app): body fat picks the direction, experience caps how fast a
 * surplus can turn into muscle, and long diets earn a maintenance block first
 * (`adaptive-thermogenesis`). Pure, so every branch is tested.
 */

export type Phase = "cut" | "bulk" | "recomp" | "maintain";

/** What happens before the phase itself. `foundations`: four weeks of
 * training at maintenance (a surplus without training is mostly fat);
 * `dietBreak`: two to four weeks at maintenance after a long diet. */
export type Lead = "none" | "foundations" | "dietBreak";

/** Why the plan is what it is, as copy keys (`roadmap.reason.*`). */
type Reason =
  | "bfHigh"
  | "bfModerate"
  | "optimalCut"
  | "optimalRecomp"
  | "leanBulk"
  | "leanMaintain"
  | "notTraining"
  | "longDiet"
  | "caution";

export type Plan = {
  phase: Phase;
  lead: Lead;
  reasons: Reason[];
  /** The body fat the plan reasoned with (known or estimated), %. */
  bodyFatPct: number;
  /** Where the phase is heading, %; null for maintenance and recomp. */
  targetBodyFatPct: number | null;
  /** Signed: negative while cutting. Null when there's no rate to hold. */
  weeklyRateKg: number | null;
  /** The same rate as a share of bodyweight, %; needs a weight. */
  weeklyRatePct: number | null;
  /** Length of one block, weeks (after the lead-in). */
  blockWeeks: number;
  /** Weeks to the target at this rate, when it takes several blocks. */
  totalWeeks: number | null;
  /** Daily calories against maintenance (negative in a deficit). */
  dailyKcalDelta: number | null;
  caution: boolean;
};

type Band = "lean" | "optimal" | "moderate" | "high";

/** The phase bands per sex, as upper bounds (%). */
const BANDS: Record<Sex, { lean: number; optimal: number; moderate: number }> =
  {
    male: { lean: 12, optimal: 15, moderate: 20 },
    female: { lean: 20, optimal: 23, moderate: 28 },
  };

const bandOf = (sex: Sex, bf: number): Band => {
  const b = BANDS[sex];
  if (bf < b.lean) return "lean";
  if (bf < b.optimal) return "optimal";
  if (bf < b.moderate) return "moderate";
  return "high";
};

/** Weekly loss by body fat (kg): the leaner you are, the slower, or the
 * deficit starts costing muscle. ~400 g suits most people. */
const cutRateKg = (sex: Sex, bf: number): number => {
  if (sex === "male") {
    if (bf >= 25) return 0.5;
    if (bf >= 20) return 0.4;
    if (bf >= 15) return 0.35;
    return 0.25;
  }
  if (bf >= 30) return 0.5;
  if (bf >= 23) return 0.4;
  return 0.3;
};

/** Monthly gain as a share of bodyweight: the muscle a surplus can build
 * shrinks with experience, and anything above it is fat. */
const BULK_MONTHLY_PCT: Record<Answers["experience"], number> = {
  none: 1.25,
  beginner: 1.25,
  intermediate: 0.75,
  advanced: 0.375,
};

/** Where a bulk stops: the top of the band, not a fat number to grow into. */
const BULK_CEILING: Record<Sex, number> = { male: 15, female: 22 };

/** A cut from above the band heads back into it; one inside it trims to its
 * floor. Either way the next phase is decided from there. */
const cutTarget = (sex: Sex, band: Band): number =>
  band === "optimal" ? BANDS[sex].lean : BANDS[sex].optimal;

/** One block, weeks. A cut stops at twelve for a maintenance break, which is
 * how adaptive thermogenesis and diet fatigue are kept in check. */
const BLOCK_WEEKS = { cut: 12, bulk: 16, recomp: 12, maintain: 8 } as const;
const DIET_BREAK_WEEKS = 2;

/** ~7,700 kcal per kg of bodyweight change, spread over a week. */
const KCAL_PER_KG_WEEK = 7700 / 7;
const WEEKS_PER_MONTH = 4.345;
/** A cautious plan never loses faster than this. */
const CAUTION_MAX_LOSS_KG = 0.3;

const round = (n: number, step: number) => Math.round(n / step) * step;

const pickPhase = (a: Answers, band: Band): { phase: Phase; why: Reason } => {
  if (band === "high") return { phase: "cut", why: "bfHigh" };
  if (band === "moderate") return { phase: "cut", why: "bfModerate" };
  // Inside the band there's no direction to force: training hard at
  // maintenance swaps fat for muscle. Only a fat-loss goal trims toward its
  // floor; a bulk starts from the lean side of the band.
  if (band === "optimal")
    return a.goal === "lose_fat"
      ? { phase: "cut", why: "optimalCut" }
      : { phase: "recomp", why: "optimalRecomp" };
  if (a.goal === "lose_fat" || a.goal === "maintain")
    return { phase: "maintain", why: "leanMaintain" };
  return { phase: "bulk", why: "leanBulk" };
};

/** Weeks to `target` body fat at a constant lean mass, at `rateKg`/week. */
const weeksTo = (
  weightKg: number,
  bf: number,
  target: number,
  rateKg: number,
): number => {
  const lean = weightKg * (1 - bf / 100);
  const targetWeight = lean / (1 - target / 100);
  return Math.max(1, Math.ceil(Math.abs(weightKg - targetWeight) / rateKg));
};

export const recommend = (a: Answers): Plan => {
  const bf = bodyFatOf(a);
  const band = bandOf(a.sex, bf);
  const { phase, why } = pickPhase(a, band);
  const reasons: Reason[] = [why];

  let lead: Lead = "none";
  if (a.trainingNow === "none" && phase !== "cut") {
    lead = "foundations";
    reasons.push("notTraining");
  }
  if (phase === "cut" && a.dietHistory === "long") {
    lead = "dietBreak";
    reasons.push("longDiet");
  }
  if (a.caution) reasons.push("caution");

  let weeklyRateKg: number | null = null;
  let weeklyRatePct: number | null = null;
  let targetBodyFatPct: number | null = null;
  let totalWeeks: number | null = null;

  if (phase === "cut") {
    const rate = cutRateKg(a.sex, bf);
    weeklyRateKg = -(a.caution ? Math.min(rate, CAUTION_MAX_LOSS_KG) : rate);
    targetBodyFatPct = cutTarget(a.sex, band);
    if (a.weightKg) {
      weeklyRatePct = round((weeklyRateKg / a.weightKg) * 100, 0.05);
      const weeks = weeksTo(
        a.weightKg,
        bf,
        targetBodyFatPct,
        Math.abs(weeklyRateKg),
      );
      if (weeks > BLOCK_WEEKS.cut) totalWeeks = weeks;
    }
  } else if (phase === "bulk") {
    const monthly = BULK_MONTHLY_PCT[a.experience] / (a.caution ? 2 : 1);
    weeklyRatePct = round(monthly / WEEKS_PER_MONTH, 0.05);
    targetBodyFatPct = BULK_CEILING[a.sex];
    weeklyRateKg = a.weightKg
      ? round((a.weightKg * weeklyRatePct) / 100, 0.05)
      : null;
  }

  return {
    phase,
    lead,
    reasons,
    bodyFatPct: bf,
    targetBodyFatPct,
    weeklyRateKg,
    weeklyRatePct,
    blockWeeks: BLOCK_WEEKS[phase],
    totalWeeks,
    dailyKcalDelta:
      weeklyRateKg === null
        ? phase === "recomp" || phase === "maintain"
          ? 0
          : null
        : round(weeklyRateKg * KCAL_PER_KG_WEEK, 10),
    caution: a.caution,
  };
};

/** Weeks the lead-in takes before the phase starts. */
export const leadWeeks = (lead: Lead): number =>
  lead === "foundations" ? 4 : lead === "dietBreak" ? DIET_BREAK_WEEKS : 0;
