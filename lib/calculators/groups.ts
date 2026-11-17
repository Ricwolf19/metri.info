import type { TranslationKey } from "@/lib/i18n/en";
import type { CalcRouteId } from "@/lib/i18n/routes";

/**
 * The calculators in three groups, as the site menu lists them. Every
 * calculator sits in exactly one group (`groups.test.ts`), so a new one
 * can't go missing from the menu.
 */
export const CALC_GROUPS: {
  id: "energy" | "body" | "training";
  key: TranslationKey;
  calcs: readonly CalcRouteId[];
}[] = [
  {
    id: "energy",
    key: "nav.group.energy",
    calcs: ["tdee", "macros", "deficit", "protein", "water", "calsburned"],
  },
  {
    id: "body",
    key: "nav.group.body",
    calcs: ["bodyfat", "bmi", "idealweight", "ffmi", "leanmass", "whtr"],
  },
  {
    id: "training",
    key: "nav.group.training",
    calcs: ["onerm", "plates", "wilks", "heartrate", "lbkg"],
  },
];
