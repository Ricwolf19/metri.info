import type { CalcRouteId } from "@/lib/i18n/routes";

/**
 * Relevant knowledge-base guides per calculator — surfaced under the result so
 * people who don't know the concepts can read the "why" in plain English.
 * Slugs map to `content/docs/{locale}/<slug>.mdx`.
 */
export const CALC_GUIDES: Partial<Record<CalcRouteId, string[]>> = {
  tdee: ["bmr-tdee-guide", "personalizing-your-diet"],
  macros: ["macros-calculator-guide", "macros"],
  protein: ["macros", "personalizing-your-diet"],
  deficit: ["personalizing-your-diet", "bmr-tdee-guide"],
  calsburned: ["tdee"],
  bodyfat: ["body-fat-guide"],
  bmi: ["bmi-healthy-weight"],
  ffmi: ["ffmi-guide"],
  idealweight: ["bmi-healthy-weight"],
  leanmass: ["body-fat-guide", "ffmi-guide"],
  whtr: ["bmi-healthy-weight"],
  onerm: ["one-rep-max-guide", "progressive-overload"],
  wilks: ["one-rep-max-guide"],
  water: ["hydration-calculator-guide", "hydration"],
};
