import type { TranslationKey } from "@/lib/i18n/en";

/**
 * Mirrored from the mobile app (`src/features/training/muscles.ts`): the
 * anatomical heads every exercise is attributed to, and the category fallback
 * for a custom exercise that names none. Ids are a sync wire format (they sit
 * in `exercises.primary_muscles`), never rename them.
 */
export const MUSCLE_HEADS = [
  "chest",
  "upper_chest",
  "lats",
  "mid_back",
  "lower_back",
  "traps",
  "front_delts",
  "side_delts",
  "rear_delts",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "obliques",
  "quads",
  "hamstrings",
  "glutes",
  "adductors",
  "calves",
] as const;

export type MuscleHead = (typeof MUSCLE_HEADS)[number];

export type ExerciseCategory =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "full_body"
  | "cardio";

const HEADS: readonly string[] = MUSCLE_HEADS;

const isMuscleHead = (value: string): value is MuscleHead =>
  HEADS.includes(value);

/** Pre-v5 catalog spellings an imported or unsynced row may still carry. */
const HEAD_ALIASES: Record<string, MuscleHead> = {
  quadriceps: "quads",
  core: "abs",
  hamstring: "hamstrings",
  glute: "glutes",
  forearm: "forearms",
};

const normalizeHead = (value: string): MuscleHead | null =>
  isMuscleHead(value) ? value : (HEAD_ALIASES[value] ?? null);

/** Known heads of a stored list, aliases resolved, duplicates collapsed. */
export const knownHeads = (
  stored: readonly string[] | null | undefined,
): MuscleHead[] => {
  const out: MuscleHead[] = [];
  for (const raw of stored ?? []) {
    const head = normalizeHead(raw);
    if (head && !out.includes(head)) out.push(head);
  }
  return out;
};

/** Last-resort heads for an exercise that names none: coarse, but it keeps
 * the movement on the map instead of contributing nothing. */
export const CATEGORY_HEADS: Record<ExerciseCategory, MuscleHead[]> = {
  chest: ["chest"],
  back: ["lats"],
  legs: ["quads", "glutes"],
  shoulders: ["side_delts"],
  arms: ["biceps", "triceps"],
  core: ["abs"],
  full_body: [],
  cardio: [],
};

const CATEGORIES: readonly string[] = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "full_body",
  "cardio",
];

export const isExerciseCategory = (value: unknown): value is ExerciseCategory =>
  typeof value === "string" && CATEGORIES.includes(value);

export const muscleHeadKey = (head: MuscleHead): TranslationKey =>
  `muscle.${head}`;
