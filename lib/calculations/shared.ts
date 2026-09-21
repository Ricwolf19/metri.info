/**
 * Shared primitives for the calculation modules — pure, no framework deps.
 * All inputs metric (kg, cm, years); callers handle units and labels.
 */

export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type Goal = "cut" | "maintain" | "bulk";

export type OneRmFormula = "epley" | "brzycki";

export type BmrFormula = "harris" | "mifflin" | "katch";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** A calculator goal plus the phase the mobile body module adds on top of it. */
export type MacroPhase = Goal | "recomp";

/** Protein per kg of BODYWEIGHT — the fallback basis when body fat is unknown. */
export const PROTEIN_PER_KG: Record<MacroPhase, number> = {
  cut: 2.2,
  maintain: 2.0,
  recomp: 2.0,
  bulk: 1.8,
};
export const PROTEIN_PER_KG_LEAN = 2.2;

/** Fat per kg of bodyweight — no phase may drop under the ~0.5 g/kg hormonal floor. */
export const FAT_PER_KG: Record<MacroPhase, number> = {
  cut: 0.7,
  maintain: 0.8,
  recomp: 0.8,
  bulk: 0.9,
};
export const round = (n: number, dp = 1) => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};
