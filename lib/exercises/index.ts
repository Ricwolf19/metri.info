import type { TranslationKey } from "@/lib/i18n/en";
import { EXERCISES, type Exercise } from "./data";

export * from "./data";

/** Muscle id → i18n label key. */
export const MUSCLE_LABEL: Record<string, TranslationKey> = {
  chest: "muscle.chest",
  upperBack: "muscle.upperBack",
  lats: "muscle.lats",
  lowerBack: "muscle.lowerBack",
  traps: "muscle.traps",
  frontDelts: "muscle.frontDelts",
  sideDelts: "muscle.sideDelts",
  triceps: "muscle.triceps",
  biceps: "muscle.biceps",
  forearms: "muscle.forearms",
  quads: "muscle.quads",
  hamstrings: "muscle.hamstrings",
  glutes: "muscle.glutes",
  calves: "muscle.calves",
  abs: "muscle.abs",
  obliques: "muscle.obliques",
  core: "muscle.core",
};

export const getAllExercises = (): Exercise[] => EXERCISES;

export const getExercise = (slug: string): Exercise | null =>
  EXERCISES.find((e) => e.slug === slug) ?? null;

export const getExerciseSlugs = (): string[] => EXERCISES.map((e) => e.slug);
