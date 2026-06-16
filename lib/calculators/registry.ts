import {
  bmiConfig,
  bodyfat,
  ffmiConfig,
  idealweight,
  leanmass,
  whtr,
} from "./configs/body";
import { heartrate, water } from "./configs/cardio";
import {
  calsburned,
  deficit,
  macrosConfig,
  protein,
  tdeeConfig,
} from "./configs/energy";
import { onerm, plates, wilks } from "./configs/strength";
import type { CalcConfig, CalcId } from "./types";

/** The most globally searched/used calculators — flagged for a "Popular" marker. */
const POPULAR_CALC_IDS: ReadonlySet<CalcId> = new Set<CalcId>([
  "bmi",
  "tdee",
  "macros",
  "bodyfat",
  "onerm",
  "idealweight",
]);

export const isPopularCalc = (id: CalcId): boolean => POPULAR_CALC_IDS.has(id);

export const CALCULATORS: Record<CalcId, CalcConfig> = {
  onerm,
  tdee: tdeeConfig,
  macros: macrosConfig,
  bodyfat,
  bmi: bmiConfig,
  ffmi: ffmiConfig,
  water,
  plates,
  idealweight,
  deficit,
  protein,
  leanmass,
  heartrate,
  whtr,
  wilks,
  calsburned,
};
