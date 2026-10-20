import type { Locale } from "@/lib/i18n/config";
import { EXERCISE_CATALOG } from "@/lib/training/catalog";

/** Display names for the catalog's exercises in both languages, from the
 * app's `exercise-content.ts`. A custom exercise shows the name it synced. */
export const EXERCISE_NAMES: Record<string, Record<Locale, string>> = {
  "barbell-back-squat": { en: "Squat", es: "Sentadilla libre" },
  "barbell-bench-press": { en: "Bench Press", es: "Press banca" },
  "incline-bench-press": {
    en: "Incline Bench Press",
    es: "Press banca inclinado",
  },
  "close-grip-bench-press": {
    en: "Close-Grip Bench Press",
    es: "Press banca agarre cerrado",
  },
  deadlift: { en: "Conventional Deadlift", es: "Peso muerto convencional" },
  "sumo-deadlift": { en: "Sumo Deadlift", es: "Peso muerto sumo" },
  "romanian-deadlift": { en: "Romanian Deadlift", es: "Peso muerto rumano" },
  "overhead-press": {
    en: "Barbell Overhead Press",
    es: "Press militar con barra",
  },
  "seated-barbell-press": {
    en: "Seated Barbell Press",
    es: "Press militar sentado con barra",
  },
  "seated-dumbbell-press": {
    en: "Dumbbell Overhead Press",
    es: "Press militar con mancuernas",
  },
  "lat-pulldown": { en: "Lat Pulldown", es: "Jalones en polea" },
  "leg-press": { en: "Leg Press", es: "Prensa de piernas" },
  "leg-extension": { en: "Leg Extension", es: "Extensión de cuádriceps" },
  "lying-leg-curl": { en: "Leg Curl", es: "Curl femoral" },
  "standing-leg-curl": {
    en: "Standing Single-Leg Curl",
    es: "Curl femoral de pie a una pierna",
  },
  "barbell-curl": { en: "Barbell Bicep Curl", es: "Curl de bíceps con barra" },
  "hammer-curl": { en: "Hammer Curl", es: "Curl martillo" },
  skullcrusher: {
    en: "Lying Dumbbell French Press",
    es: "Press francés tumbado con mancuernas",
  },
  "barbell-skullcrusher": {
    en: "Lying Barbell French Press",
    es: "Press francés tumbado con barra",
  },
  "back-extension": { en: "Back Extension", es: "Extensiones lumbares" },
  crunch: { en: "Crunch", es: "Abdominales" },
  "cable-crunch": { en: "Cable Crunch", es: "Crunch en polea" },
  "standing-calf-raise": { en: "Calf Raise", es: "Gemelos" },
  "machine-chest-press": {
    en: "Machine Chest Press",
    es: "Chest press en máquina",
  },
  "dumbbell-fly": { en: "Dumbbell Fly", es: "Aperturas con mancuernas" },
  "cable-fly": { en: "Cable Fly", es: "Aperturas en polea" },
  "lateral-raise": { en: "Lateral Raise", es: "Elevaciones laterales" },
  "cable-lateral-raise": {
    en: "Cable Lateral Raise",
    es: "Elevaciones laterales en polea",
  },
  "rear-delt-fly": { en: "Rear Delt Fly", es: "Hombro posterior" },
  "machine-shoulder-press": {
    en: "Machine Shoulder Press",
    es: "Press militar en máquina",
  },
  pullover: { en: "Pullover", es: "Pullover" },
  "machine-row": { en: "Machine Row", es: "Remo en máquina" },
  "dumbbell-row": { en: "Dumbbell Row", es: "Remo con mancuernas" },
  "seated-cable-row": { en: "Seated Cable Row", es: "Remo Gironda" },
  "t-bar-row": { en: "T-Bar Row", es: "Remo T" },
  "hack-squat": { en: "Hack Squat", es: "Hack squat" },
  "bulgarian-split-squat": {
    en: "Bulgarian Split Squat",
    es: "Sentadilla búlgara",
  },
  "preacher-curl": { en: "Preacher Curl", es: "Curl Scott" },
  "spider-curl": { en: "Spider Curl", es: "Spider curl" },
  "incline-dumbbell-curl": {
    en: "Incline Dumbbell Curl",
    es: "Curl inclinado con mancuerna",
  },
  "tricep-pushdown": {
    en: "Tricep Pushdown",
    es: "Extensiones de tríceps en polea",
  },
  "overhead-tricep-extension": {
    en: "Seated Dumbbell French Press",
    es: "Press francés sentado con mancuerna",
  },
  "cable-overhead-extension": {
    en: "Cable Overhead Extension",
    es: "Tríceps tras nuca en polea",
  },
  "french-press": {
    en: "Seated Barbell French Press",
    es: "Press francés sentado con barra",
  },
  "cable-kickback": { en: "Cable Kickback", es: "Kickback en polea" },
  "dumbbell-bench-press": {
    en: "Dumbbell Bench Press",
    es: "Press banca con mancuernas",
  },
  "smith-machine-bench-press": {
    en: "Smith Machine Bench Press",
    es: "Press banca en Smith",
  },
  "incline-dumbbell-press": {
    en: "Incline Dumbbell Press",
    es: "Press inclinado con mancuernas",
  },
  "goblet-squat": { en: "Goblet Squat", es: "Sentadilla goblet" },
  "smith-machine-squat": {
    en: "Smith Machine Squat",
    es: "Sentadilla en Smith",
  },
  "walking-lunge": { en: "Walking Lunge", es: "Desplantes caminando" },
  "reverse-lunge": { en: "Reverse Lunge", es: "Desplantes hacia atrás" },
  "barbell-row": { en: "Barbell Row", es: "Remo con barra" },
  "chest-supported-row": {
    en: "Chest-Supported Dumbbell Row",
    es: "Remo con mancuernas en banco inclinado",
  },
  "pull-up": { en: "Pull-Up", es: "Dominadas" },
  "assisted-pull-up": { en: "Assisted Pull-Up", es: "Dominadas asistidas" },
  "dumbbell-romanian-deadlift": {
    en: "Dumbbell Romanian Deadlift",
    es: "Peso muerto rumano con mancuernas",
  },
  "hip-thrust": { en: "Barbell Hip Thrust", es: "Hip thrust con barra" },
  "dumbbell-curl": {
    en: "Dumbbell Bicep Curl",
    es: "Curl de bíceps con mancuernas",
  },
  "cable-curl": { en: "Cable Bicep Curl", es: "Curl de bíceps en polea" },
  "machine-preacher-curl": {
    en: "Machine Preacher Curl",
    es: "Curl Scott en máquina",
  },
  "dumbbell-kickback": {
    en: "Dumbbell Kickback",
    es: "Kickback con mancuerna",
  },
  "machine-lateral-raise": {
    en: "Machine Lateral Raise",
    es: "Elevaciones laterales en máquina",
  },
  "seated-calf-raise": { en: "Seated Calf Raise", es: "Gemelos sentado" },
  "single-leg-calf-raise": {
    en: "Single-Leg Dumbbell Calf Raise",
    es: "Gemelos a una pierna con mancuerna",
  },
};

const CATALOG_NAMES = new Map(EXERCISE_CATALOG.map((e) => [e.id, e.name]));

/** What to call an exercise id: the localized catalog name, else the name a
 * custom exercise synced, else the catalog's English, else the id itself. */
export const exerciseLabel = (
  id: string,
  locale: Locale,
  customNames: Record<string, string>,
): string =>
  EXERCISE_NAMES[id]?.[locale] ??
  customNames[id] ??
  CATALOG_NAMES.get(id) ??
  id;
