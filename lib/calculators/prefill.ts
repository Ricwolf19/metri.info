import type { CalcId, CalcValues } from "./types";

/**
 * Maps each calculator's input fields to the saved-profile value that should
 * seed them. Centralised (rather than per-config) so it's easy to audit which
 * field means what — critically, a calculator's `weight` is only ever mapped to
 * body weight when that's the actual meaning. 1RM/plate `weight`/`target` are
 * *lifted* loads, so they are deliberately absent here.
 */
export type CalcProfile = {
  sex: string | null;
  bodyWeightKg: number | null;
  bodyHeightCm: number | null;
  activityLevel: string | null;
  unitsPreference: string;
};

type ProfileKey = "sex" | "bodyWeight" | "bodyHeight" | "activity";

const PREFILL: Partial<Record<CalcId, Record<string, ProfileKey>>> = {
  tdee: {
    sex: "sex",
    height: "bodyHeight",
    weight: "bodyWeight",
    activity: "activity",
  },
  macros: { weight: "bodyWeight" },
  deficit: { current: "bodyWeight" },
  protein: { weight: "bodyWeight" },
  calsburned: { weight: "bodyWeight" },
  bodyfat: { sex: "sex", height: "bodyHeight" },
  bmi: { height: "bodyHeight", weight: "bodyWeight" },
  ffmi: { weight: "bodyWeight", height: "bodyHeight" },
  idealweight: { sex: "sex", height: "bodyHeight" },
  leanmass: { sex: "sex", weight: "bodyWeight", height: "bodyHeight" },
  whtr: { height: "bodyHeight" },
  water: { weight: "bodyWeight", activity: "activity" },
  wilks: { sex: "sex", bodyweight: "bodyWeight" },
};

const valueFor = (
  key: ProfileKey,
  profile: CalcProfile,
): number | string | null => {
  switch (key) {
    case "sex":
      return profile.sex && profile.sex !== "unset" ? profile.sex : null;
    case "bodyWeight":
      return profile.bodyWeightKg;
    case "bodyHeight":
      return profile.bodyHeightCm;
    case "activity":
      return profile.activityLevel && profile.activityLevel !== "unset"
        ? profile.activityLevel
        : null;
  }
};

/** Seed `values` (metric base units) from the user's profile. Returns the new
 * values and whether anything actually changed. */
export const applyProfileToValues = (
  id: CalcId,
  values: CalcValues,
  profile: CalcProfile,
): { values: CalcValues; changed: boolean } => {
  const map = PREFILL[id];
  if (!map) return { values, changed: false };

  const next = { ...values };
  let changed = false;
  for (const [field, key] of Object.entries(map)) {
    const v = valueFor(key, profile);
    if (v !== null && v !== undefined && v !== "") {
      next[field] = v;
      changed = true;
    }
  }
  return { values: next, changed };
};
