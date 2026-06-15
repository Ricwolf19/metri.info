import type { TranslationKey } from "@/lib/i18n/en";

export const EX_CATEGORIES = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
] as const;
export type ExerciseCategory = (typeof EX_CATEGORIES)[number];

export const EX_EQUIPMENT = [
  "barbell",
  "dumbbell",
  "machine",
  "cable",
  "bodyweight",
  "kettlebell",
] as const;
export type Equipment = (typeof EX_EQUIPMENT)[number];

export type Difficulty = "beginner" | "intermediate" | "advanced";

type L = { en: string; es: string };

export type Exercise = {
  slug: string;
  name: L;
  category: ExerciseCategory;
  equipment: Equipment;
  difficulty: Difficulty;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: { en: string[]; es: string[] };
};

export const CATEGORY_LABEL: Record<ExerciseCategory, TranslationKey> = {
  chest: "ex.cat.chest",
  back: "ex.cat.back",
  legs: "ex.cat.legs",
  shoulders: "ex.cat.shoulders",
  arms: "ex.cat.arms",
  core: "ex.cat.core",
};

export const EQUIPMENT_LABEL: Record<Equipment, TranslationKey> = {
  barbell: "ex.eq.barbell",
  dumbbell: "ex.eq.dumbbell",
  machine: "ex.eq.machine",
  cable: "ex.eq.cable",
  bodyweight: "ex.eq.bodyweight",
  kettlebell: "ex.eq.kettlebell",
};

export const DIFFICULTY_LABEL: Record<Difficulty, TranslationKey> = {
  beginner: "ex.diff.beginner",
  intermediate: "ex.diff.intermediate",
  advanced: "ex.diff.advanced",
};

export const EXERCISES: Exercise[] = [
  {
    slug: "barbell-bench-press",
    name: { en: "Barbell Bench Press", es: "Press de banca con barra" },
    category: "chest",
    equipment: "barbell",
    difficulty: "intermediate",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "frontDelts"],
    instructions: {
      en: [
        "Lie on the bench with eyes under the bar, feet flat, and a slight arch.",
        "Grip just wider than shoulder-width and unrack to lockout over your chest.",
        "Lower under control to the mid-chest, then press up and slightly back.",
      ],
      es: [
        "Túmbate con los ojos bajo la barra, pies firmes y un ligero arco.",
        "Agarre algo más ancho que los hombros y saca la barra hasta el bloqueo.",
        "Baja con control hasta el pecho medio y empuja hacia arriba y algo atrás.",
      ],
    },
  },
  {
    slug: "push-up",
    name: { en: "Push-Up", es: "Flexión de pecho" },
    category: "chest",
    equipment: "bodyweight",
    difficulty: "beginner",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "frontDelts", "core"],
    instructions: {
      en: [
        "Start in a plank with hands just wider than shoulders, body in a straight line.",
        "Lower your chest toward the floor, elbows at roughly 45 degrees.",
        "Press back to full lockout, keeping your core and glutes tight.",
      ],
      es: [
        "Empieza en plancha con manos algo más anchas que los hombros y cuerpo recto.",
        "Baja el pecho hacia el suelo con los codos a unos 45 grados.",
        "Empuja hasta el bloqueo manteniendo core y glúteos firmes.",
      ],
    },
  },
  {
    slug: "pull-up",
    name: { en: "Pull-Up", es: "Dominada" },
    category: "back",
    equipment: "bodyweight",
    difficulty: "intermediate",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "upperBack"],
    instructions: {
      en: [
        "Hang from the bar with an overhand grip, shoulders slightly engaged.",
        "Pull your chest toward the bar by driving the elbows down and back.",
        "Lower under control to a full hang and repeat.",
      ],
      es: [
        "Cuélgate de la barra con agarre prono y hombros ligeramente activos.",
        "Lleva el pecho hacia la barra empujando los codos hacia abajo y atrás.",
        "Baja con control hasta la extensión completa y repite.",
      ],
    },
  },
  {
    slug: "barbell-deadlift",
    name: { en: "Barbell Deadlift", es: "Peso muerto con barra" },
    category: "back",
    equipment: "barbell",
    difficulty: "advanced",
    primaryMuscles: ["lowerBack", "glutes", "hamstrings"],
    secondaryMuscles: ["quads", "traps", "forearms"],
    instructions: {
      en: [
        "Set mid-foot under the bar, hinge and grip just outside your knees.",
        "Brace, flatten your back, and push the floor away to stand tall.",
        "Lock out hips and knees together, then hinge the bar back down.",
      ],
      es: [
        "Coloca el medio pie bajo la barra, haz bisagra y agarra fuera de las rodillas.",
        "Aprieta el core, espalda neutra y empuja el suelo hasta ponerte de pie.",
        "Bloquea cadera y rodillas a la vez y baja la barra con bisagra.",
      ],
    },
  },
  {
    slug: "bent-over-barbell-row",
    name: { en: "Bent-Over Barbell Row", es: "Remo con barra inclinado" },
    category: "back",
    equipment: "barbell",
    difficulty: "intermediate",
    primaryMuscles: ["upperBack", "lats"],
    secondaryMuscles: ["biceps", "lowerBack"],
    instructions: {
      en: [
        "Hinge to about 45 degrees with a flat back and the bar hanging at arm's length.",
        "Row the bar to your lower ribs by pulling the elbows back.",
        "Lower under control without rounding your spine.",
      ],
      es: [
        "Haz bisagra a unos 45 grados con espalda neutra y la barra colgando.",
        "Rema la barra hacia las costillas bajas llevando los codos atrás.",
        "Baja con control sin redondear la columna.",
      ],
    },
  },
  {
    slug: "barbell-back-squat",
    name: { en: "Barbell Back Squat", es: "Sentadilla trasera con barra" },
    category: "legs",
    equipment: "barbell",
    difficulty: "intermediate",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "lowerBack"],
    instructions: {
      en: [
        "Set the bar on your upper back, brace, and step out to shoulder-width.",
        "Sit down and back, knees tracking over your toes, to at least parallel.",
        "Drive up through mid-foot to a tall lockout.",
      ],
      es: [
        "Coloca la barra en la espalda alta, aprieta y abre a la anchura de hombros.",
        "Baja sentándote atrás, rodillas hacia las puntas, al menos a paralelo.",
        "Sube empujando con el medio pie hasta el bloqueo.",
      ],
    },
  },
  {
    slug: "romanian-deadlift",
    name: { en: "Romanian Deadlift", es: "Peso muerto rumano" },
    category: "legs",
    equipment: "barbell",
    difficulty: "intermediate",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lowerBack"],
    instructions: {
      en: [
        "Stand tall holding the bar, knees softly bent.",
        "Push your hips back, sliding the bar down your thighs until you feel a hamstring stretch.",
        "Drive the hips forward to stand, squeezing the glutes.",
      ],
      es: [
        "De pie con la barra y las rodillas ligeramente flexionadas.",
        "Lleva la cadera atrás deslizando la barra por los muslos hasta estirar el femoral.",
        "Empuja la cadera adelante para subir apretando los glúteos.",
      ],
    },
  },
  {
    slug: "walking-lunge",
    name: { en: "Walking Lunge", es: "Zancada caminando" },
    category: "legs",
    equipment: "dumbbell",
    difficulty: "beginner",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "calves"],
    instructions: {
      en: [
        "Hold a dumbbell in each hand, standing tall.",
        "Step forward and lower until both knees reach about 90 degrees.",
        "Drive through the front foot to step into the next lunge.",
      ],
      es: [
        "Sujeta una mancuerna en cada mano, de pie y erguido.",
        "Da un paso adelante y baja hasta que ambas rodillas lleguen a unos 90 grados.",
        "Empuja con el pie delantero para avanzar a la siguiente zancada.",
      ],
    },
  },
  {
    slug: "overhead-press",
    name: { en: "Overhead Press", es: "Press militar" },
    category: "shoulders",
    equipment: "barbell",
    difficulty: "intermediate",
    primaryMuscles: ["frontDelts", "sideDelts"],
    secondaryMuscles: ["triceps", "upperBack"],
    instructions: {
      en: [
        "Hold the bar at shoulder height, elbows slightly in front, core braced.",
        "Press straight overhead, moving your head back then through at lockout.",
        "Lower under control to the front of the shoulders.",
      ],
      es: [
        "Sujeta la barra a la altura de los hombros, codos algo adelante y core firme.",
        "Empuja recto sobre la cabeza, llevando la cabeza atrás y luego al frente al bloquear.",
        "Baja con control hasta el frente de los hombros.",
      ],
    },
  },
  {
    slug: "dumbbell-lateral-raise",
    name: {
      en: "Dumbbell Lateral Raise",
      es: "Elevación lateral con mancuernas",
    },
    category: "shoulders",
    equipment: "dumbbell",
    difficulty: "beginner",
    primaryMuscles: ["sideDelts"],
    secondaryMuscles: ["frontDelts"],
    instructions: {
      en: [
        "Hold a dumbbell in each hand at your sides, a slight bend in the elbows.",
        "Raise the weights out to shoulder height, leading with the elbows.",
        "Lower slowly under control; avoid swinging.",
      ],
      es: [
        "Sujeta una mancuerna a cada lado con una ligera flexión en los codos.",
        "Eleva los pesos hasta la altura de los hombros guiando con los codos.",
        "Baja despacio y con control; evita el balanceo.",
      ],
    },
  },
  {
    slug: "dumbbell-biceps-curl",
    name: { en: "Dumbbell Biceps Curl", es: "Curl de bíceps con mancuernas" },
    category: "arms",
    equipment: "dumbbell",
    difficulty: "beginner",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    instructions: {
      en: [
        "Stand tall with a dumbbell in each hand, palms facing forward.",
        "Curl the weights toward your shoulders without swinging the elbows.",
        "Lower slowly to a full stretch and repeat.",
      ],
      es: [
        "De pie con una mancuerna en cada mano y las palmas al frente.",
        "Flexiona los pesos hacia los hombros sin balancear los codos.",
        "Baja despacio hasta la extensión completa y repite.",
      ],
    },
  },
  {
    slug: "plank",
    name: { en: "Plank", es: "Plancha" },
    category: "core",
    equipment: "bodyweight",
    difficulty: "beginner",
    primaryMuscles: ["abs", "core"],
    secondaryMuscles: ["obliques", "lowerBack"],
    instructions: {
      en: [
        "Rest on your forearms and toes with your body in a straight line.",
        "Brace your abs and squeeze your glutes; don't let the hips sag or pike.",
        "Hold for time, breathing steadily.",
      ],
      es: [
        "Apóyate en antebrazos y puntas con el cuerpo en línea recta.",
        "Aprieta abdomen y glúteos; no dejes caer ni elevar la cadera.",
        "Mantén el tiempo objetivo respirando de forma constante.",
      ],
    },
  },
];
