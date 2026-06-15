import type { TranslationKey } from "@/lib/i18n/en";
import type { Difficulty } from "@/lib/exercises/data";

type L = { en: string; es: string };

export type ProgramGoal =
  | "strength"
  | "hypertrophy"
  | "powerbuilding"
  | "endurance";

export type ProgramExercise = {
  slug: string;
  sets: number;
  reps: string;
  rir?: number;
};

export type ProgramDay = {
  name: L;
  focus: string[];
  exercises: ProgramExercise[];
};

export type Program = {
  slug: string;
  name: L;
  description: L;
  durationWeeks: number;
  daysPerWeek: number;
  difficulty: Difficulty;
  goal: ProgramGoal;
  featured?: boolean;
  days: ProgramDay[];
};

export const GOAL_LABEL: Record<ProgramGoal, TranslationKey> = {
  strength: "program.goal.strength",
  hypertrophy: "program.goal.hypertrophy",
  powerbuilding: "program.goal.powerbuilding",
  endurance: "program.goal.endurance",
};

export const PROGRAMS: Program[] = [
  {
    slug: "powerbuilding-ppl",
    name: { en: "PowerBuilding PPL", es: "PowerBuilding PPL" },
    description: {
      en: "A push/pull/legs split blending strength work with hypertrophy volume — build muscle and get strong on the big lifts.",
      es: "Una rutina push/pull/legs que mezcla fuerza con volumen de hipertrofia — gana músculo y fuerza en los básicos.",
    },
    durationWeeks: 8,
    daysPerWeek: 3,
    difficulty: "intermediate",
    goal: "powerbuilding",
    featured: true,
    days: [
      {
        name: { en: "Push", es: "Empuje" },
        focus: ["chest", "shoulders", "triceps"],
        exercises: [
          { slug: "barbell-bench-press", sets: 4, reps: "5–8", rir: 2 },
          { slug: "overhead-press", sets: 3, reps: "6–10", rir: 2 },
          { slug: "dumbbell-lateral-raise", sets: 3, reps: "12–15", rir: 1 },
          { slug: "push-up", sets: 2, reps: "AMRAP", rir: 0 },
        ],
      },
      {
        name: { en: "Pull", es: "Tirón" },
        focus: ["back", "biceps"],
        exercises: [
          { slug: "barbell-deadlift", sets: 3, reps: "3–5", rir: 2 },
          { slug: "pull-up", sets: 3, reps: "6–10", rir: 1 },
          { slug: "bent-over-barbell-row", sets: 3, reps: "8–12", rir: 2 },
          { slug: "dumbbell-biceps-curl", sets: 3, reps: "10–15", rir: 1 },
        ],
      },
      {
        name: { en: "Legs", es: "Pierna" },
        focus: ["quads", "hamstrings", "glutes"],
        exercises: [
          { slug: "barbell-back-squat", sets: 4, reps: "5–8", rir: 2 },
          { slug: "romanian-deadlift", sets: 3, reps: "8–12", rir: 2 },
          { slug: "walking-lunge", sets: 3, reps: "10–12", rir: 1 },
          { slug: "plank", sets: 3, reps: "45–60s", rir: 0 },
        ],
      },
    ],
  },
  {
    slug: "full-body-foundations",
    name: { en: "Full-Body Foundations", es: "Cimientos de cuerpo completo" },
    description: {
      en: "A simple 3-day full-body program for beginners — learn the main lifts and build a base of strength and muscle.",
      es: "Un programa simple de cuerpo completo de 3 días para principiantes — aprende los básicos y crea una base de fuerza y músculo.",
    },
    durationWeeks: 6,
    daysPerWeek: 2,
    difficulty: "beginner",
    goal: "strength",
    days: [
      {
        name: { en: "Day A", es: "Día A" },
        focus: ["legs", "chest", "back"],
        exercises: [
          { slug: "barbell-back-squat", sets: 3, reps: "5–8", rir: 3 },
          { slug: "barbell-bench-press", sets: 3, reps: "5–8", rir: 3 },
          { slug: "bent-over-barbell-row", sets: 3, reps: "8–10", rir: 3 },
          { slug: "plank", sets: 3, reps: "30–45s", rir: 0 },
        ],
      },
      {
        name: { en: "Day B", es: "Día B" },
        focus: ["legs", "shoulders", "back"],
        exercises: [
          { slug: "romanian-deadlift", sets: 3, reps: "8–10", rir: 3 },
          { slug: "overhead-press", sets: 3, reps: "6–10", rir: 3 },
          { slug: "pull-up", sets: 3, reps: "AMRAP", rir: 1 },
          { slug: "walking-lunge", sets: 2, reps: "10–12", rir: 2 },
        ],
      },
    ],
  },
];

export const getAllPrograms = (): Program[] => PROGRAMS;
export const getProgram = (slug: string): Program | null =>
  PROGRAMS.find((p) => p.slug === slug) ?? null;
export const getProgramSlugs = (): string[] => PROGRAMS.map((p) => p.slug);
