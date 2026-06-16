/**
 * Pure calculation logic — ported 1:1 from the Metri mobile app. No framework
 * or i18n deps so it can be shared/tested anywhere. All inputs metric
 * (kg, cm, years); callers handle units and labels.
 *
 * This barrel re-exports the domain modules so consumers keep importing
 * everything from "@/lib/calculations".
 */

export {
  type ActivityLevel,
  type BmrFormula,
  type Goal,
  type OneRmFormula,
  type Sex,
} from "./shared";

export { RM_PERCENTAGES, dotsScore, oneRm, plateLoad } from "./strength";

export {
  ACTIVITY_METS,
  bmr,
  calorieDeficit,
  caloriesBurned,
  macros,
  proteinTarget,
  tdee,
} from "./energy";

export {
  bmi,
  bmiCategory,
  bodyFatCategory,
  bodyFatNavy,
  ffmi,
  ffmiBand,
  healthyWeightRange,
  idealWeight,
  leanMass,
  waistToHeight,
  whtrBand,
} from "./body";

export { HR_ZONES, heartRateZones, hydration } from "./cardio";
