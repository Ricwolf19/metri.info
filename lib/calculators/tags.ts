import type { Locale } from "@/lib/i18n/config";
import type { CalcRouteId } from "@/lib/i18n/routes";

/**
 * Search/category tags per calculator, localized. Rendered as neutral chips and
 * matched (accent-insensitive) by the tools search. Acronyms (1rm, ffmi, met…)
 * stay the same in both languages.
 */
type LocalizedTags = Record<Locale, string[]>;

export const CALC_TAGS: Record<CalcRouteId, LocalizedTags> = {
  onerm: {
    en: ["1rm", "strength", "epley", "brzycki"],
    es: ["1rm", "fuerza", "epley", "brzycki"],
  },
  tdee: {
    en: ["tdee", "bmr", "calories", "metabolism"],
    es: ["tdee", "tmb", "calorías", "metabolismo"],
  },
  macros: {
    en: ["macros", "protein", "carbs", "fat"],
    es: ["macros", "proteína", "carbohidratos", "grasa"],
  },
  bodyfat: {
    en: ["body fat", "navy", "composition"],
    es: ["grasa corporal", "navy", "composición"],
  },
  bmi: {
    en: ["bmi", "weight", "health"],
    es: ["imc", "peso", "salud"],
  },
  ffmi: {
    en: ["ffmi", "muscle", "lean mass"],
    es: ["ffmi", "músculo", "masa magra"],
  },
  water: {
    en: ["hydration", "water"],
    es: ["hidratación", "agua"],
  },
  plates: {
    en: ["plates", "barbell", "loading"],
    es: ["discos", "barra", "carga"],
  },
  idealweight: {
    en: ["ideal weight", "bmi"],
    es: ["peso ideal", "imc"],
  },
  deficit: {
    en: ["deficit", "calories", "cut", "weight loss"],
    es: ["déficit", "calorías", "definición", "pérdida de peso"],
  },
  protein: {
    en: ["protein", "macros", "nutrition"],
    es: ["proteína", "macros", "nutrición"],
  },
  leanmass: {
    en: ["lean mass", "body fat"],
    es: ["masa magra", "grasa corporal"],
  },
  heartrate: {
    en: ["heart rate", "zones", "cardio"],
    es: ["frecuencia cardíaca", "zonas", "cardio"],
  },
  whtr: {
    en: ["waist", "ratio", "health"],
    es: ["cintura", "ratio", "salud"],
  },
  wilks: {
    en: ["wilks", "dots", "powerlifting"],
    es: ["wilks", "dots", "powerlifting"],
  },
  calsburned: {
    en: ["calories", "met", "cardio"],
    es: ["calorías", "met", "cardio"],
  },
};
