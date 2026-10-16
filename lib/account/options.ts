/** Value sets shared with the mobile app (`src/db/schema.ts`, `storage.ts`).
 * The profile form offers exactly these and `lib/account/profile-input.ts`
 * (used by the web save action AND `/api/profile`) stores nothing else, so the
 * app never receives a value it can't restore. */
export const ACTIVITY_LEVELS = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
] as const;
export const BMR_FORMULAS = [
  "mifflin_st_jeor",
  "harris_benedict",
  "katch_mcardle",
] as const;
export const SEXES = ["male", "female"] as const;
export const CLOCK_FORMATS = ["24", "12"] as const;
export const APP_LOCALES = ["en", "es"] as const;
