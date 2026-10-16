import {
  ACTIVITY_LEVELS,
  APP_LOCALES,
  BMR_FORMULAS,
  CLOCK_FORMATS,
  SEXES,
} from "@/lib/account/options";

/**
 * One normalizer for the `user_profile` row, shared by the web save action and
 * the app's `PUT /api/profile`, so both write the same whitelist with the same
 * ranges. Anything outside a range or an option set becomes `null` here; a
 * caller that wants to reject instead (the web form) checks `profileRangeError`
 * first.
 */
type NumericRange = { min: number; max: number; integer?: boolean };

const AGE_RANGE: NumericRange = { min: 10, max: 120, integer: true };
const BODY_FAT_RANGE: NumericRange = { min: 2, max: 70 };
const WEIGHT_KG_RANGE: NumericRange = { min: 20, max: 400 };
const HEIGHT_CM_RANGE: NumericRange = { min: 80, max: 260 };
const PROFILE_STRING_MAX = 64;

const toNumberOrNull = (raw: unknown): number | null => {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
};

const inRange = (n: number, range: NumericRange): boolean =>
  n >= range.min && n <= range.max && (!range.integer || Number.isInteger(n));

const rangeOrNull = (raw: unknown, range: NumericRange): number | null => {
  const n = toNumberOrNull(raw);
  return n !== null && inRange(n, range) ? n : null;
};

/** Keep a value only when it is one of the app's known options. */
const oneOf = <T extends string>(
  raw: unknown,
  allowed: readonly T[],
): T | null =>
  typeof raw === "string" && (allowed as readonly string[]).includes(raw)
    ? (raw as T)
    : null;

const optionalString = (
  raw: unknown,
  max = PROFILE_STRING_MAX,
): string | null => {
  const s = typeof raw === "string" ? raw.trim() : "";
  return s.length > 0 && s.length <= max ? s : null;
};

/** Raw field values as either caller receives them (form strings or JSON). */
export type ProfileFieldsInput = {
  displayName?: unknown;
  sex?: unknown;
  age?: unknown;
  activityLevel?: unknown;
  bodyWeightKg?: unknown;
  bodyHeightCm?: unknown;
  bodyFatPct?: unknown;
  bmrFormula?: unknown;
  clockFormat?: unknown;
  locale?: unknown;
  unitsPreference?: unknown;
};

/** The normalized, whitelisted columns both writers store. */
export const normalizeProfileFields = (input: ProfileFieldsInput) => ({
  displayName: optionalString(input.displayName),
  sex: oneOf(input.sex, SEXES),
  age: rangeOrNull(input.age, AGE_RANGE),
  activityLevel: oneOf(input.activityLevel, ACTIVITY_LEVELS),
  bodyWeightKg: rangeOrNull(input.bodyWeightKg, WEIGHT_KG_RANGE),
  bodyHeightCm: rangeOrNull(input.bodyHeightCm, HEIGHT_CM_RANGE),
  bodyFatPct: rangeOrNull(input.bodyFatPct, BODY_FAT_RANGE),
  bmrFormula: oneOf(input.bmrFormula, BMR_FORMULAS),
  clockFormat: oneOf(input.clockFormat, CLOCK_FORMATS),
  locale: oneOf(input.locale, APP_LOCALES),
  unitsPreference: input.unitsPreference === "lb" ? "lb" : "kg",
});

/** First numeric field that is present but outside its range — for callers
 * that surface a validation error instead of silently dropping the value. */
export const profileRangeError = (
  input: ProfileFieldsInput,
): "age" | "bodyFatPct" | "bodyWeightKg" | "bodyHeightCm" | null => {
  const checks = [
    ["age", AGE_RANGE],
    ["bodyFatPct", BODY_FAT_RANGE],
    ["bodyWeightKg", WEIGHT_KG_RANGE],
    ["bodyHeightCm", HEIGHT_CM_RANGE],
  ] as const;
  for (const [field, range] of checks) {
    const n = toNumberOrNull(input[field]);
    if (n !== null && !inRange(n, range)) return field;
  }
  return null;
};
