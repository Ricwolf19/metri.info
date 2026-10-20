import type { QuizArea } from "@/lib/quiz/areas";

/**
 * The knowledge quiz bank: four or more questions per (area, level) cell,
 * sixty-five in all. The first sixteen came from the app's former
 * `src/features/quiz` bank (the web is the quiz's home now), the rest were
 * written for the web and lifted from the knowledge base, so a retake is not
 * a repeat. Bilingual copy sits beside the data (content-module convention;
 * these are not UI strings). Levels run basic (1) → pro (4); `answer` is the
 * index into `options`.
 *
 * Writing rule, held by `content.test.ts`: the right answer must not be the
 * longest option more often than chance, and never by a wide margin. "Pick
 * the longest one" is the first guessing strategy anyone tries, and a
 * diagnostic that rewards it measures nothing. Keep distractors plausible
 * and about as long as the answer.
 *
 * Invariant the tests hold: every cell has at least three questions (two are
 * asked per attempt), every question has exactly four options and a `why` in
 * both languages.
 */

type Localized = { en: string; es: string };

export type QuizQuestion = {
  area: QuizArea;
  level: 1 | 2 | 3 | 4;
  prompt: Localized;
  options: Localized[];
  answer: number;
  why: Localized;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    area: "nutrition",
    level: 1,
    prompt: { en: "What is a calorie?", es: "¿Qué es una caloría?" },
    options: [
      {
        en: "A unit of energy in food",
        es: "Una unidad de energía de los alimentos",
      },
      { en: "A type of fat cell", es: "Un tipo de célula grasa" },
      { en: "A vitamin", es: "Una vitamina" },
      { en: "A sugar molecule", es: "Una molécula de azúcar" },
    ],
    answer: 0,
    why: {
      en: "A calorie is the energy needed to warm 1 g of water by 1 °C; food labels count kilocalories. It measures energy, not a substance in the food.",
      es: "Una caloría es la energía necesaria para calentar 1 g de agua 1 °C; las etiquetas cuentan kilocalorías. Mide energía, no una sustancia del alimento.",
    },
  },
  {
    area: "nutrition",
    level: 2,
    prompt: {
      en: "About how much protein per kg of body weight suits most lifters?",
      es: "¿Cuánta proteína por kg de peso le va bien a la mayoría que entrena?",
    },
    options: [
      { en: "1.6 g/kg", es: "1,6 g/kg" },
      { en: "0.3 g/kg", es: "0,3 g/kg" },
      { en: "6 g/kg", es: "6 g/kg" },
      { en: "Only on training days", es: "Solo los días de entreno" },
    ],
    answer: 0,
    why: {
      en: "Around 1.6 g/kg a day covers muscle gain for most lifters; more rarely adds anything, and far less leaves recovery short.",
      es: "Alrededor de 1,6 g/kg al día cubre la ganancia muscular de la mayoría; más rara vez suma algo y mucho menos se queda corto para recuperarse.",
    },
  },
  {
    area: "nutrition",
    level: 3,
    prompt: {
      en: "Carbohydrates are stored in muscle mainly as…",
      es: "Los carbohidratos se almacenan en el músculo principalmente como…",
    },
    options: [
      { en: "Amino acids", es: "Aminoácidos" },
      { en: "Ketone bodies", es: "Cuerpos cetónicos" },
      { en: "Glycogen", es: "Glucógeno" },
      { en: "Triglycerides", es: "Triglicéridos" },
    ],
    answer: 2,
    why: {
      en: "Muscle stores carbohydrate as glycogen, a chain of glucose it burns quickly during hard sets. Triglycerides are how fat is stored.",
      es: "El músculo guarda los carbohidratos como glucógeno, una cadena de glucosa que quema rápido en series intensas. Los triglicéridos son la reserva de grasa.",
    },
  },
  {
    area: "nutrition",
    level: 4,
    prompt: {
      en: '"Energy availability" measures…',
      es: 'La "disponibilidad de energía" mide…',
    },
    options: [
      {
        en: "Calories left after training, per kg of lean mass",
        es: "Calorías que quedan tras entrenar, por kg de masa magra",
      },
      {
        en: "Total calories eaten over the day, per kg of body weight",
        es: "Calorías totales comidas en el día, por kg de peso corporal",
      },
      {
        en: "How alert and awake you feel through the training day",
        es: "Qué tan despierto y alerta te sientes durante el día de entreno",
      },
      {
        en: "The glycemic index of the meal eaten before training",
        es: "El índice glucémico de la comida previa al entrenamiento",
      },
    ],
    answer: 0,
    why: {
      en: "Energy availability is intake minus training expenditure, per kg of lean mass. Too low for too long and recovery, hormones and performance suffer.",
      es: "La disponibilidad energética es lo que comes menos lo que gastas entrenando, por kg de masa magra. Si queda baja mucho tiempo, sufren la recuperación, las hormonas y el rendimiento.",
    },
  },
  {
    area: "training",
    level: 1,
    prompt: {
      en: 'In the gym, a "set" is…',
      es: 'En el gimnasio, una "serie" es…',
    },
    options: [
      {
        en: "A group of reps done before resting",
        es: "Un grupo de repeticiones hechas antes de descansar",
      },
      {
        en: "A full week of planned workouts",
        es: "Una semana completa de entrenamientos planeados",
      },
      {
        en: "A setting on a cable machine",
        es: "Un ajuste en una máquina de poleas",
      },
      {
        en: "A stretch held before training",
        es: "Un estiramiento sostenido antes de entrenar",
      },
    ],
    answer: 0,
    why: {
      en: "A set is a run of consecutive reps followed by rest. Programs count work in sets, so the set is the basic unit of training volume.",
      es: "Una serie es un bloque de repeticiones seguidas antes de descansar. Los programas cuentan el trabajo en series: es la unidad básica del volumen.",
    },
  },
  {
    area: "training",
    level: 1,
    prompt: {
      en: "In a squat, which part of the rep is the concentric phase?",
      es: "En una sentadilla, ¿qué parte de la repetición es la fase concéntrica?",
    },
    options: [
      { en: "Standing back up", es: "Subir de vuelta" },
      { en: "Lowering into the squat", es: "Bajar a la sentadilla" },
      { en: "The pause at the bottom", es: "La pausa abajo" },
      { en: "Unracking the bar", es: "Sacar la barra del rack" },
    ],
    answer: 0,
    why: {
      en: "Concentric means the muscle shortens while it produces force: the way up in a squat, the curl up in a biceps curl. Eccentric is the lowering, where the muscle lengthens under load; that phase causes most of the soreness afterwards.",
      es: "Concéntrica significa que el músculo se acorta mientras produce fuerza: la subida en la sentadilla, la subida en un curl de bíceps. La excéntrica es la bajada, donde el músculo se alarga bajo carga; esa fase causa la mayor parte del dolor muscular posterior.",
    },
  },
  {
    area: "training",
    level: 2,
    prompt: {
      en: '"RIR 2" on a set means…',
      es: '"RIR 2" en una serie significa…',
    },
    options: [
      { en: "2 reps left in reserve", es: "2 repeticiones de reserva" },
      { en: "2 reps already completed", es: "2 repeticiones ya completadas" },
      {
        en: "Rest 2 minutes before the set",
        es: "Descansar 2 minutos antes de la serie",
      },
      {
        en: "2 exercises paired in a superset",
        es: "2 ejercicios combinados en superserie",
      },
    ],
    answer: 0,
    why: {
      en: "RIR means reps in reserve: stopping at RIR 2 leaves two clean reps you could still have done. It lets you set effort without going to failure.",
      es: "RIR son las repeticiones en reserva: parar en RIR 2 deja dos repeticiones limpias que aún podías hacer. Permite fijar el esfuerzo sin llegar al fallo.",
    },
  },
  {
    area: "training",
    level: 3,
    prompt: {
      en: "Progressive overload is…",
      es: "La sobrecarga progresiva es…",
    },
    options: [
      {
        en: "Gradually increasing the demand over time",
        es: "Aumentar poco a poco la exigencia con el tiempo",
      },
      {
        en: "Switching to a new program every single week",
        es: "Cambiar a un programa nuevo cada semana",
      },
      {
        en: "Taking every working set to muscular failure",
        es: "Llevar cada serie de trabajo al fallo muscular",
      },
      {
        en: "Cutting the weight back in every session",
        es: "Bajar el peso en cada sesión de entrenamiento",
      },
    ],
    answer: 0,
    why: {
      en: "The body adapts to what it is asked to do, so the demand has to rise over time: more load, more reps or more sets, a little at a time.",
      es: "El cuerpo se adapta a lo que se le pide, así que la exigencia tiene que subir con el tiempo: más carga, más repeticiones o más series, poco a poco.",
    },
  },
  {
    area: "training",
    level: 4,
    prompt: {
      en: "Why do submaximal sets estimate 1RM more reliably than very high-rep sets?",
      es: "¿Por qué las series submáximas estiman el 1RM mejor que las de muchas repeticiones?",
    },
    options: [
      {
        en: "High-rep sets fatigue technique before strength",
        es: "Con muchas reps la técnica se cansa antes que la fuerza",
      },
      {
        en: "High-rep sets train endurance and build no strength at all",
        es: "Las series de muchas reps dan resistencia y nada de fuerza",
      },
      {
        en: "The formulas were only ever validated below five reps",
        es: "Las fórmulas solo se validaron por debajo de cinco reps",
      },
      {
        en: "They do not; every rep range is equally reliable",
        es: "No es así; cualquier rango de reps es igual de fiable",
      },
    ],
    answer: 0,
    why: {
      en: "Long sets end when breathing and technique give out, not strength, so the estimate drifts. Sets of about 3–8 reps near failure track 1RM more closely.",
      es: "Las series largas terminan cuando fallan el aire y la técnica, no la fuerza, así que la estimación se desvía. Series de unas 3–8 repeticiones cerca del fallo siguen mejor el 1RM.",
    },
  },
  {
    area: "body",
    level: 1,
    prompt: { en: "BMI is calculated from…", es: "El IMC se calcula con…" },
    options: [
      { en: "Weight and height only", es: "Solo peso y altura" },
      { en: "Body fat and muscle", es: "Grasa y músculo" },
      { en: "Waist and neck", es: "Cintura y cuello" },
      { en: "Age and sex only", es: "Solo edad y sexo" },
    ],
    answer: 0,
    why: {
      en: "BMI is weight in kg divided by height in metres squared. It ignores body composition, so a muscular lifter can read as overweight.",
      es: "El IMC es el peso en kg dividido entre la altura en metros al cuadrado. Ignora la composición corporal: alguien musculoso puede salir con sobrepeso.",
    },
  },
  {
    area: "body",
    level: 2,
    prompt: {
      en: "A growing waist mostly tracks…",
      es: "Una cintura creciente sobre todo refleja…",
    },
    options: [
      {
        en: "Fat gain around the abdomen",
        es: "Grasa ganada alrededor del abdomen",
      },
      { en: "Bone density changes", es: "Cambios en la densidad ósea" },
      { en: "Muscle gained in the arms", es: "Músculo ganado en los brazos" },
      { en: "Water held under the skin", es: "Agua retenida bajo la piel" },
    ],
    answer: 0,
    why: {
      en: "Most of what the waist gains or loses is abdominal fat, which is why the tape at the waist is a useful check alongside the scale.",
      es: "Casi todo lo que gana o pierde la cintura es grasa abdominal; por eso la cinta en la cintura es un buen control junto a la báscula.",
    },
  },
  {
    area: "body",
    level: 3,
    prompt: {
      en: "The Navy method estimates body fat from…",
      es: "El método Navy estima la grasa corporal con…",
    },
    options: [
      {
        en: "Tape measures of neck, waist and height",
        es: "Medidas de cinta: cuello, cintura y estatura",
      },
      {
        en: "A skinfold caliper reading at several sites",
        es: "Un plicómetro leído en varios pliegues",
      },
      {
        en: "An electrical impedance scan on a smart scale",
        es: "Un escaneo de impedancia en una báscula inteligente",
      },
      {
        en: "A blood test ordered by a sports doctor",
        es: "Un análisis de sangre pedido por un médico deportivo",
      },
    ],
    answer: 0,
    why: {
      en: "The Navy method estimates body fat from height and tape circumferences (neck and waist, plus hips for women). No caliper, scan or blood test involved.",
      es: "El método Navy estima la grasa con la altura y medidas de cinta (cuello y cintura, más cadera en mujeres). Sin plicómetro, escáner ni análisis de sangre.",
    },
  },
  {
    area: "body",
    level: 4,
    prompt: {
      en: "Why can the scale go up while fat goes down?",
      es: "¿Por qué puede subir la báscula mientras baja la grasa?",
    },
    options: [
      {
        en: "Muscle, water and glycogen add weight that is not fat",
        es: "Músculo, agua y glucógeno suman peso que no es grasa",
      },
      {
        en: "It cannot; a calibrated scale is exact to the gram",
        es: "No puede; una báscula calibrada es exacta al gramo",
      },
      {
        en: "Fat always weighs more than muscle per litre",
        es: "La grasa siempre pesa más que el músculo por litro",
      },
      {
        en: "Scales drift upward as the battery runs down",
        es: "Las básculas marcan más conforme se gasta la pila",
      },
    ],
    answer: 0,
    why: {
      en: "New muscle, stored glycogen and the water it holds all weigh something. The scale can rise while fat falls, which is why the waist is read alongside it.",
      es: "El músculo nuevo, el glucógeno y el agua que retiene también pesan. La báscula puede subir mientras la grasa baja; por eso se lee junto a la cintura.",
    },
  },
  {
    area: "fundamentals",
    level: 1,
    prompt: {
      en: "The point of a warm-up is to…",
      es: "El objetivo del calentamiento es…",
    },
    options: [
      {
        en: "Prepare the tissues and the nervous system",
        es: "Preparar los tejidos y el sistema nervioso",
      },
      {
        en: "Burn extra calories before the workout",
        es: "Quemar calorías extra antes de entrenar",
      },
      {
        en: "Stretch every muscle as far as it goes",
        es: "Estirar cada músculo hasta donde llegue",
      },
      {
        en: "Make you sweat before the first set",
        es: "Hacerte sudar antes de la primera serie",
      },
    ],
    answer: 0,
    why: {
      en: "A warm-up raises tissue temperature and primes the nervous system for the loads ahead. Burning calories or stretching to the limit is not the goal.",
      es: "El calentamiento sube la temperatura de los tejidos y prepara al sistema nervioso para las cargas que vienen. Quemar calorías o estirar al máximo no es el objetivo.",
    },
  },
  {
    area: "fundamentals",
    level: 2,
    prompt: {
      en: "DOMS (delayed onset muscle soreness) comes from…",
      es: "El DOMS (dolor muscular de aparición tardía) viene de…",
    },
    options: [
      {
        en: "Loading the body is not used to",
        es: "Una carga a la que el cuerpo no está acostumbrado",
      },
      {
        en: "Lactic acid stuck in the muscle fibres",
        es: "Ácido láctico atascado en las fibras musculares",
      },
      {
        en: "Not stretching enough after the session",
        es: "No estirar lo suficiente después de la sesión",
      },
      {
        en: "A small muscle tear that needs rest",
        es: "Un pequeño desgarro muscular que necesita reposo",
      },
    ],
    answer: 0,
    why: {
      en: "DOMS follows loading the body is not used to, especially lowering phases. Lactic acid clears within an hour, so it cannot explain soreness days later.",
      es: "Las agujetas aparecen tras cargas a las que el cuerpo no está acostumbrado, sobre todo en la fase de bajada. El ácido láctico se elimina en una hora; no explica el dolor días después.",
    },
  },
  {
    area: "fundamentals",
    level: 3,
    prompt: {
      en: '"Training to failure" means…',
      es: '"Entrenar al fallo" significa…',
    },
    options: [
      {
        en: "No more reps possible with good form",
        es: "No salen más repeticiones con buena técnica",
      },
      {
        en: "Training until you feel sick or dizzy",
        es: "Entrenar hasta sentirte mal o mareado",
      },
      {
        en: "Skipping the warm-up to save energy",
        es: "Saltarte el calentamiento para ahorrar energía",
      },
      {
        en: "Finishing the program without missing a day",
        es: "Terminar el programa sin faltar un día",
      },
    ],
    answer: 0,
    why: {
      en: "Failure is the rep you cannot complete with good form. It is RIR 0: useful now and then, costly in fatigue if every set goes there.",
      es: "El fallo es la repetición que ya no puedes completar con buena técnica. Es RIR 0: útil de vez en cuando, caro en fatiga si todas las series llegan ahí.",
    },
  },
  {
    area: "fundamentals",
    level: 4,
    prompt: {
      en: "Why do deloads (easier weeks) exist?",
      es: "¿Por qué existen las semanas de descarga?",
    },
    options: [
      {
        en: "Fatigue fades faster than fitness, so capacity rebounds",
        es: "La fatiga baja más rápido que la forma, y la capacidad rebota",
      },
      {
        en: "To learn new exercises while the body is fresh",
        es: "Para aprender ejercicios nuevos con el cuerpo fresco",
      },
      {
        en: "Because muscle only grows during a full week of rest",
        es: "Porque el músculo solo crece en una semana de descanso",
      },
      {
        en: "They exist only for beginners in their first year",
        es: "Solo existen para principiantes en su primer año",
      },
    ],
    answer: 0,
    why: {
      en: "Fatigue builds and fades faster than fitness. An easier week lets it clear while the fitness stays, so performance rebounds afterwards.",
      es: "La fatiga se acumula y se disipa más rápido que la forma física. Una semana más ligera la deja bajar mientras la forma se mantiene, y el rendimiento repunta después.",
    },
  },
  {
    area: "nutrition",
    level: 1,
    prompt: {
      en: "Which macronutrient carries the most calories per gram?",
      es: "¿Qué macronutriente aporta más calorías por gramo?",
    },
    options: [
      { en: "Protein", es: "Proteína" },
      { en: "Carbohydrate", es: "Carbohidrato" },
      { en: "Fat", es: "Grasa" },
      { en: "Fiber", es: "Fibra" },
    ],
    answer: 2,
    why: {
      en: "Fat has 9 kcal per gram; protein and carbohydrate have 4. That is why a spoon of oil adds up faster than a spoon of rice.",
      es: "La grasa tiene 9 kcal por gramo; la proteína y el carbohidrato, 4. Por eso una cucharada de aceite suma más rápido que una de arroz.",
    },
  },
  {
    area: "nutrition",
    level: 2,
    prompt: {
      en: "Spreading protein across the day means…",
      es: "Repartir la proteína a lo largo del día significa…",
    },
    options: [
      {
        en: "Three to five meals with a solid portion each",
        es: "Tres a cinco comidas con una porción sólida cada una",
      },
      {
        en: "One large serving at dinner, when the body absorbs best",
        es: "Una porción grande en la cena, cuando mejor se absorbe",
      },
      {
        en: "Protein only on training days, none on rest days",
        es: "Proteína solo los días de entreno, nada en descanso",
      },
      {
        en: "A shake every hour to keep amino acids topped up",
        es: "Un batido cada hora para mantener los aminoácidos",
      },
    ],
    answer: 0,
    why: {
      en: "Muscle protein synthesis responds per meal, so several portions of roughly 0.3 to 0.4 g per kg beat one big one. The daily total still matters most.",
      es: "La síntesis de proteína muscular responde por comida, así que varias porciones de unos 0.3 a 0.4 g por kg superan a una sola grande. El total diario sigue siendo lo más importante.",
    },
  },
  {
    area: "nutrition",
    level: 3,
    prompt: {
      en: "Your real maintenance intake is best confirmed by…",
      es: "Tu ingesta real de mantenimiento se confirma mejor con…",
    },
    options: [
      {
        en: "Two or three weeks of a stable weekly weight average",
        es: "Dos o tres semanas con un promedio semanal estable",
      },
      {
        en: "One full week of daily morning weigh-ins",
        es: "Una semana completa de pesajes matutinos diarios",
      },
      {
        en: "The TDEE formula alone, since it includes activity",
        es: "La fórmula de TDEE sola, porque ya incluye actividad",
      },
      {
        en: "How hungry you feel at the end of each day",
        es: "Cuánta hambre sientes al final de cada día",
      },
    ],
    answer: 0,
    why: {
      en: "A formula estimates; the weight trend measures. When the weekly average holds for a few weeks at an intake, that intake is your maintenance, whatever the calculator said.",
      es: "La fórmula estima; la tendencia del peso mide. Cuando el promedio semanal se mantiene varias semanas con una ingesta, esa ingesta es tu mantenimiento, diga lo que diga la calculadora.",
    },
  },
  {
    area: "nutrition",
    level: 4,
    prompt: {
      en: "Why do most diets stall a few weeks into a deficit?",
      es: "¿Por qué la mayoría de las dietas se estancan tras unas semanas de déficit?",
    },
    options: [
      {
        en: "Less body and less movement shrink the deficit",
        es: "Menos cuerpo y menos movimiento encogen el déficit",
      },
      {
        en: "The metabolism breaks and stops burning fat for good",
        es: "El metabolismo se rompe y deja de quemar grasa",
      },
      {
        en: "Carbohydrates stop being digested after two weeks",
        es: "Los carbohidratos dejan de digerirse a las dos semanas",
      },
      {
        en: "Fat turns into water weight before it leaves the body",
        es: "La grasa se vuelve agua antes de salir del cuerpo",
      },
    ],
    answer: 0,
    why: {
      en: "Losing weight lowers what you burn, and spontaneous movement drops with it (adaptive thermogenesis). The same calories become maintenance; the fix is a re-check, not willpower.",
      es: "Perder peso reduce lo que gastas y el movimiento espontáneo baja con ello (termogénesis adaptativa). Las mismas calorías pasan a ser mantenimiento; la solución es recalcular, no más fuerza de voluntad.",
    },
  },
  {
    area: "training",
    level: 1,
    prompt: { en: "A rep is…", es: "Una repetición es…" },
    options: [
      {
        en: "One complete movement of an exercise",
        es: "Un movimiento completo de un ejercicio",
      },
      {
        en: "A group of movements done without resting",
        es: "Un grupo de movimientos hechos sin descansar",
      },
      {
        en: "The rest taken between two exercises",
        es: "El descanso que tomas entre dos ejercicios",
      },
      {
        en: "A light warm-up set before the real work",
        es: "Una serie ligera de calentamiento antes del trabajo",
      },
    ],
    answer: 0,
    why: {
      en: "One rep is one full execution, from start position back to start. A set is a group of reps done without resting.",
      es: "Una repetición es una ejecución completa, de la posición inicial de vuelta al inicio. Una serie es un grupo de repeticiones sin descansar.",
    },
  },
  {
    area: "training",
    level: 2,
    prompt: {
      en: "How long should you rest between hard sets of a compound lift?",
      es: "¿Cuánto conviene descansar entre series duras de un ejercicio compuesto?",
    },
    options: [
      { en: "About 15 seconds", es: "Unos 15 segundos" },
      { en: "Two to three minutes", es: "De dos a tres minutos" },
      { en: "Ten minutes or more", es: "Diez minutos o más" },
      {
        en: "Rest does not change the next set",
        es: "El descanso no cambia la siguiente serie",
      },
    ],
    answer: 1,
    why: {
      en: "Longer rests restore strength for the next set, so you lift more total load. Short rests suit isolation work; big lifts earn two to three minutes.",
      es: "Descansos más largos recuperan la fuerza para la siguiente serie, así que mueves más carga total. Los descansos cortos valen para aislamiento; los grandes levantamientos merecen dos o tres minutos.",
    },
  },
  {
    area: "training",
    level: 3,
    prompt: {
      en: "For muscle growth, most working sets should end around…",
      es: "Para ganar músculo, la mayoría de las series efectivas deberían terminar cerca de…",
    },
    options: [
      { en: "0 RIR, always to failure", es: "0 RIR, siempre al fallo" },
      { en: "1 to 3 RIR", es: "1 a 3 RIR" },
      { en: "5 to 6 RIR", es: "5 a 6 RIR" },
      { en: "10 RIR", es: "10 RIR" },
    ],
    answer: 1,
    why: {
      en: "Growth needs sets close to failure, but a small reserve keeps technique and recovery intact across the week. Failure is a tool for some sets, not the rule.",
      es: "Crecer requiere series cercanas al fallo, pero una pequeña reserva conserva la técnica y la recuperación durante la semana. El fallo es una herramienta para algunas series, no la regla.",
    },
  },
  {
    area: "training",
    level: 4,
    prompt: {
      en: "Volume keeps rising, lifts stall and joints ache. The most likely reading is…",
      es: "El volumen sigue subiendo, las cargas se estancan y las articulaciones duelen. La lectura más probable es…",
    },
    options: [
      {
        en: "Volume outran recovery; cut it and rebuild",
        es: "El volumen superó la recuperación; recórtalo y reconstruye",
      },
      {
        en: "You need even more sets to break the plateau",
        es: "Necesitas aún más series para romper la meseta",
      },
      {
        en: "Switch to cardio only until the joints calm down",
        es: "Pásate solo a cardio hasta que calmen las articulaciones",
      },
      {
        en: "Your protein intake is too high for the volume",
        es: "Tu proteína es demasiado alta para ese volumen",
      },
    ],
    answer: 0,
    why: {
      en: "Volume only helps up to the amount you can recover from. Past it, performance drops and aches appear; the fix is less, better-recovered work, then a slow climb.",
      es: "El volumen solo ayuda hasta la cantidad de la que puedes recuperarte. Más allá, el rendimiento cae y aparecen molestias; la solución es menos trabajo, mejor recuperado, y después una subida lenta.",
    },
  },
  {
    area: "body",
    level: 1,
    prompt: {
      en: "Body composition compares…",
      es: "La composición corporal compara…",
    },
    options: [
      { en: "Fat mass versus lean mass", es: "Masa grasa frente a masa magra" },
      {
        en: "Height, age and shoe size",
        es: "Estatura, edad y talla de calzado",
      },
      { en: "Steps taken and hours slept", es: "Pasos dados y horas dormidas" },
      {
        en: "Water weight and bone weight",
        es: "Peso de agua y peso de hueso",
      },
    ],
    answer: 0,
    why: {
      en: "Two bodies of the same weight can look and perform very differently; what differs is how much of that weight is fat versus muscle, bone and water.",
      es: "Dos cuerpos del mismo peso pueden verse y rendir muy distinto; lo que cambia es cuánto de ese peso es grasa y cuánto músculo, hueso y agua.",
    },
  },
  {
    area: "body",
    level: 2,
    prompt: {
      en: "The most useful weekly progress check at home is…",
      es: "El control de progreso semanal más útil en casa es…",
    },
    options: [
      {
        en: "The weekly weight average plus a waist measurement",
        es: "El promedio semanal de peso más una medida de cintura",
      },
      {
        en: "A single morning weight on the same day each week",
        es: "Un solo pesaje matutino el mismo día cada semana",
      },
      {
        en: "Daily progress photos in the same light",
        es: "Fotos de progreso diarias con la misma luz",
      },
      {
        en: "A smart scale's body-fat reading every morning",
        es: "La grasa que marca una báscula inteligente cada mañana",
      },
    ],
    answer: 0,
    why: {
      en: "Daily weight swings with water and food; the weekly average smooths it, and the tape catches fat change the scale hides.",
      es: "El peso diario oscila con el agua y la comida; el promedio semanal lo suaviza, y la cinta detecta cambios de grasa que la báscula oculta.",
    },
  },
  {
    area: "body",
    level: 3,
    prompt: {
      en: "A waist-to-height ratio above 0.5 suggests…",
      es: "Una ratio cintura-altura por encima de 0.5 sugiere…",
    },
    options: [
      {
        en: "Central fat worth addressing, whatever the BMI",
        es: "Grasa central que conviene atender, diga lo que diga el IMC",
      },
      {
        en: "Nothing on its own; only BMI is a valid measure",
        es: "Nada por sí solo; solo el IMC es una medida válida",
      },
      {
        en: "You are underweight and should eat more",
        es: "Que estás bajo de peso y deberías comer más",
      },
      {
        en: "Too much muscle around the midsection",
        es: "Demasiado músculo alrededor del torso",
      },
    ],
    answer: 0,
    why: {
      en: "Keeping the waist under half your height is a simple screen for visceral fat and it works for muscular people, where BMI does not.",
      es: "Mantener la cintura por debajo de la mitad de tu estatura es un cribado sencillo de grasa visceral y funciona en personas musculadas, donde el IMC no.",
    },
  },
  {
    area: "body",
    level: 4,
    prompt: {
      en: "In a recomposition phase, what tells you more than the scale?",
      es: "En una fase de recomposición, ¿qué dice más que la báscula?",
    },
    options: [
      {
        en: "Strength trends and the waist, over weeks",
        es: "La tendencia de fuerza y la cintura, en semanas",
      },
      {
        en: "Day-to-day weight swings on the bathroom scale",
        es: "Los vaivenes diarios del peso en la báscula",
      },
      {
        en: "How much you sweat through a training session",
        es: "Cuánto sudas en una sesión de entrenamiento",
      },
      {
        en: "Your daily step count compared with last month",
        es: "Tus pasos diarios comparados con el mes pasado",
      },
    ],
    answer: 0,
    why: {
      en: "Fat down and muscle up can cancel out on the scale. Rising lifts with a shrinking waist is the pattern that proves the recomposition is working.",
      es: "Bajar grasa y subir músculo puede anularse en la báscula. Cargas que suben con una cintura que baja es el patrón que demuestra que la recomposición funciona.",
    },
  },
  {
    area: "fundamentals",
    level: 1,
    prompt: {
      en: "BMR stands for the calories you burn…",
      es: "El BMR son las calorías que quemas…",
    },
    options: [
      { en: "At complete rest", es: "En reposo total" },
      { en: "In a workout", es: "En un entrenamiento" },
      { en: "Walking your daily steps", es: "Caminando tus pasos diarios" },
      { en: "Digesting food", es: "Digiriendo la comida" },
    ],
    answer: 0,
    why: {
      en: "Basal metabolic rate is what the body spends just to stay alive, awake and at rest. Everything else is added on top of it.",
      es: "La tasa metabólica basal es lo que el cuerpo gasta solo por mantenerse vivo, despierto y en reposo. Todo lo demás se suma encima.",
    },
  },
  {
    area: "fundamentals",
    level: 2,
    prompt: { en: "TDEE includes…", es: "El TDEE incluye…" },
    options: [
      {
        en: "BMR, daily movement, exercise and digestion",
        es: "TMB, movimiento diario, ejercicio y digestión",
      },
      {
        en: "Only the calories burned during planned exercise",
        es: "Solo las calorías quemadas en el ejercicio planeado",
      },
      {
        en: "Only the calories food costs to digest",
        es: "Solo las calorías que cuesta digerir la comida",
      },
      {
        en: "Only the calories burned while you sleep",
        es: "Solo las calorías quemadas mientras duermes",
      },
    ],
    answer: 0,
    why: {
      en: "Total daily energy expenditure is the whole day: resting metabolism, moving around, training and the thermic effect of food.",
      es: "El gasto energético diario total es el día completo: metabolismo en reposo, moverte, entrenar y el efecto térmico de la comida.",
    },
  },
  {
    area: "fundamentals",
    level: 3,
    prompt: {
      en: "When is Katch-McArdle a better BMR formula than Mifflin-St Jeor?",
      es: "¿Cuándo Katch-McArdle es mejor fórmula de BMR que Mifflin-St Jeor?",
    },
    options: [
      {
        en: "When you know your body-fat percentage with some confidence",
        es: "Cuando conoces tu porcentaje de grasa con cierta confianza",
      },
      {
        en: "When you would rather not enter any body data at all",
        es: "Cuando prefieres no meter ningún dato corporal",
      },
      {
        en: "When you train more than three days a week",
        es: "Cuando entrenas más de tres días por semana",
      },
      {
        en: "When you are under thirty and fairly lean",
        es: "Cuando tienes menos de treinta y estás bastante magro",
      },
    ],
    answer: 0,
    why: {
      en: "Katch-McArdle works from lean mass, so it is more accurate for very lean or very muscular people, but only if the body-fat input is good. Otherwise Mifflin is the safer default.",
      es: "Katch-McArdle parte de la masa magra, así que es más precisa en personas muy magras o muy musculadas, pero solo si el dato de grasa es bueno. Si no, Mifflin es la opción segura.",
    },
  },
  {
    area: "fundamentals",
    level: 4,
    prompt: {
      en: "Why do a formula, a watch and a tracking app disagree on your calories?",
      es: "¿Por qué una fórmula, un reloj y una app de registro no coinciden en tus calorías?",
    },
    options: [
      {
        en: "All three estimate; only the weight trend confirms",
        es: "Los tres estiman; solo la tendencia del peso confirma",
      },
      {
        en: "The watch is always right because it measures heart rate",
        es: "El reloj siempre acierta porque mide el pulso",
      },
      {
        en: "Formulas ignore your age, so they drift as you get older",
        es: "Las fórmulas ignoran tu edad y se desvían al envejecer",
      },
      {
        en: "Apps measure body fat directly through the camera",
        es: "Las apps miden la grasa directamente con la cámara",
      },
    ],
    answer: 0,
    why: {
      en: "Each tool models you differently and none measures what you actually burn. Pick one, hold it steady and let two or three weeks of the scale trend correct it.",
      es: "Cada herramienta te modela distinto y ninguna mide lo que realmente gastas. Elige una, mantenla fija y deja que dos o tres semanas de tendencia del peso la corrijan.",
    },
  },
  {
    area: "nutrition",
    level: 1,
    prompt: {
      en: "A practical daily water baseline from the hydration guide is…",
      es: "Una referencia diaria práctica de agua según la guía de hidratación es…",
    },
    options: [
      {
        en: "About 30 to 35 ml per kg, more when you sweat",
        es: "Unos 30 a 35 ml por kg, más si sudas",
      },
      {
        en: "About one glass a day, more if you feel thirsty",
        es: "Un vaso al día, más si tienes sed",
      },
      {
        en: "Exactly 8 litres a day, no matter your size",
        es: "Exactamente 8 litros al día, sin importar tu tamaño",
      },
      {
        en: "Only what thirst asks for during training",
        es: "Solo lo que pida la sed durante el entrenamiento",
      },
    ],
    answer: 0,
    why: {
      en: "The guide scales water to body weight and activity instead of a fixed number of glasses. Training days, heat and a high-protein diet all push it up.",
      es: "La guía escala el agua al peso corporal y la actividad en lugar de un número fijo de vasos. Los días de entreno, el calor y una dieta alta en proteína lo suben.",
    },
  },
  {
    area: "nutrition",
    level: 2,
    prompt: { en: "Tracking macros means…", es: "Registrar macros significa…" },
    options: [
      {
        en: "Logging protein, carbs and fat in grams",
        es: "Registrar proteína, carbos y grasa en gramos",
      },
      {
        en: "Counting only total calories, nothing else",
        es: "Contar solo las calorías totales y nada más",
      },
      {
        en: "Avoiding every carbohydrate after six in the evening",
        es: "Evitar todo carbohidrato después de las seis de la tarde",
      },
      {
        en: "Weighing yourself after every single meal",
        es: "Pesarte después de cada comida",
      },
    ],
    answer: 0,
    why: {
      en: "Calories set the direction; the macro split sets what the body has to work with. Protein is the target you hold steady, carbs and fat fill the rest.",
      es: "Las calorías marcan la dirección; el reparto de macros decide con qué trabaja el cuerpo. La proteína es el objetivo fijo; carbohidratos y grasa completan el resto.",
    },
  },
  {
    area: "nutrition",
    level: 3,
    prompt: {
      en: "Creatine monohydrate is best taken…",
      es: "La creatina monohidrato se toma mejor…",
    },
    options: [
      {
        en: "3 to 5 g every day, with no cycling needed",
        es: "3 a 5 g cada día, sin necesidad de ciclarla",
      },
      {
        en: "Only before training, 20 g in one go",
        es: "Solo antes de entrenar, 20 g de golpe",
      },
      {
        en: "Once a week, the day after a hard session",
        es: "Una vez por semana, al día siguiente de una sesión dura",
      },
      {
        en: "Only during a bulk, never in a cut",
        es: "Solo en volumen, nunca en definición",
      },
    ],
    answer: 0,
    why: {
      en: "A small daily dose saturates the muscle in a few weeks; a loading phase only gets there faster. It is the best-studied supplement in the guide, and the cheapest.",
      es: "Una dosis diaria pequeña satura el músculo en unas semanas; una fase de carga solo llega antes. Es el suplemento mejor estudiado de la guía, y el más barato.",
    },
  },
  {
    area: "nutrition",
    level: 4,
    prompt: {
      en: "After two flat weeks on a cut, the diet guide adjusts first…",
      es: "Tras dos semanas sin cambios en definición, la guía ajusta primero…",
    },
    options: [
      {
        en: "Calories by 5 to 10 percent, protein untouched",
        es: "Las calorías un 5 a 10 por ciento, sin tocar la proteína",
      },
      {
        en: "Protein, down by half to save calories",
        es: "La proteína, a la mitad para ahorrar calorías",
      },
      {
        en: "Water intake, up by a litre a day",
        es: "El agua, un litro más al día",
      },
      {
        en: "Nothing; wait two more months before changing anything",
        es: "Nada; espera dos meses más antes de cambiar algo",
      },
    ],
    answer: 0,
    why: {
      en: "Small calorie steps keep training quality and let the next two weeks show whether the move was enough. Protein stays put so the loss is fat, not muscle.",
      es: "Pasos pequeños de calorías conservan la calidad del entreno y dejan que las dos semanas siguientes muestren si bastó. La proteína se mantiene para que lo que se pierda sea grasa, no músculo.",
    },
  },
  {
    area: "training",
    level: 1,
    prompt: { en: "ROM stands for…", es: "ROM significa…" },
    options: [
      { en: "Rate of muscle", es: "Ritmo del músculo" },
      { en: "Range of motion", es: "Rango de movimiento" },
      { en: "Rest of month", es: "Resto del mes" },
      { en: "Repetitions on machines", es: "Repeticiones en máquinas" },
    ],
    answer: 1,
    why: {
      en: "The distance a joint travels in a rep. The technique guide favours a full range: more muscle worked per rep and a safer movement.",
      es: "La distancia que recorre una articulación en una repetición. La guía de técnica favorece el rango completo: más músculo trabajado por repetición y un movimiento más seguro.",
    },
  },
  {
    area: "training",
    level: 2,
    prompt: {
      en: "A common weekly volume range for growing a muscle is…",
      es: "Un rango semanal habitual de volumen para hacer crecer un músculo es…",
    },
    options: [
      { en: "10 to 20 hard sets", es: "10 a 20 series duras" },
      { en: "1 to 2 hard sets", es: "1 a 2 series duras" },
      { en: "50 or more hard sets", es: "50 o más series duras" },
      {
        en: "Any number works the same",
        es: "Cualquier número funciona igual",
      },
    ],
    answer: 0,
    why: {
      en: "The volume guide lands most lifters between ten and twenty quality sets per muscle per week, moving up slowly only when recovery allows.",
      es: "La guía de volumen sitúa a la mayoría entre diez y veinte series de calidad por músculo y semana, subiendo despacio solo cuando la recuperación lo permite.",
    },
  },
  {
    area: "training",
    level: 3,
    prompt: {
      en: "A tempo written 3-1-1 means…",
      es: "Un tempo escrito 3-1-1 significa…",
    },
    options: [
      {
        en: "3 s lowering, 1 s pause, 1 s lifting",
        es: "3 s bajando, 1 s de pausa, 1 s subiendo",
      },
      {
        en: "3 sets, 1 rep each, 1 minute of rest",
        es: "3 series de 1 repetición con 1 minuto de descanso",
      },
      {
        en: "3 exercises, 1 round, 1 day of rest after",
        es: "3 ejercicios, 1 ronda y 1 día de descanso después",
      },
      {
        en: "3 warm-ups, 1 work set, 1 drop set",
        es: "3 calentamientos, 1 serie efectiva y 1 serie descendente",
      },
    ],
    answer: 0,
    why: {
      en: "Tempo counts the phases of one rep: eccentric, pause, concentric. A slower eccentric raises time under tension without adding weight.",
      es: "El tempo cuenta las fases de una repetición: excéntrica, pausa, concéntrica. Una excéntrica más lenta aumenta el tiempo bajo tensión sin añadir peso.",
    },
  },
  {
    area: "training",
    level: 4,
    prompt: {
      en: "Why split the same weekly volume over two sessions instead of one?",
      es: "¿Por qué repartir el mismo volumen semanal en dos sesiones en vez de una?",
    },
    options: [
      {
        en: "Fresher sets, so quality and the weekly load both go up",
        es: "Series más frescas: suben la calidad y la carga semanal",
      },
      {
        en: "It burns more calories across the week",
        es: "Quema más calorías a lo largo de la semana",
      },
      {
        en: "Muscle protein synthesis only runs on two days",
        es: "La síntesis de proteína solo ocurre dos días",
      },
      {
        en: "One long session is not allowed in most gyms",
        es: "Una sesión larga no está permitida en casi ningún gimnasio",
      },
    ],
    answer: 0,
    why: {
      en: "Late sets in a long session are done tired. Two shorter exposures keep rep quality high and the growth signal repeated across the week.",
      es: "Las últimas series de una sesión larga se hacen cansado. Dos exposiciones más cortas mantienen la calidad de las repeticiones y repiten el estímulo durante la semana.",
    },
  },
  {
    area: "body",
    level: 1,
    prompt: {
      en: "A kilogram of muscle and a kilogram of fat…",
      es: "Un kilo de músculo y un kilo de grasa…",
    },
    options: [
      {
        en: "Weigh the same; muscle takes less space",
        es: "Pesan lo mismo; el músculo ocupa menos espacio",
      },
      {
        en: "Muscle weighs more, by about a fifth",
        es: "El músculo pesa más, cerca de una quinta parte",
      },
      {
        en: "Fat weighs more, because it floats",
        es: "La grasa pesa más, porque flota",
      },
      {
        en: "Take up exactly the same space in the body",
        es: "Ocupan exactamente el mismo espacio en el cuerpo",
      },
    ],
    answer: 0,
    why: {
      en: "A kilogram is a kilogram. Muscle is denser, so the same weight looks smaller and tighter, which is why body composition matters more than the scale.",
      es: "Un kilo es un kilo. El músculo es más denso, así que el mismo peso se ve más pequeño y firme; por eso la composición corporal importa más que la báscula.",
    },
  },
  {
    area: "body",
    level: 2,
    prompt: {
      en: "The main limit of BMI for lifters is that it…",
      es: "El principal límite del IMC para quien entrena es que…",
    },
    options: [
      {
        en: "Cannot tell muscle from fat",
        es: "No distingue músculo de grasa",
      },
      {
        en: "Needs a blood test to be accurate",
        es: "Necesita un análisis de sangre para ser exacto",
      },
      {
        en: "Only works for women under forty",
        es: "Solo funciona en mujeres menores de cuarenta",
      },
      { en: "Changes every hour of the day", es: "Cambia cada hora del día" },
    ],
    answer: 0,
    why: {
      en: "A muscular person reads as overweight by BMI. That is why the guide pairs it with waist-to-height or a body-fat estimate before drawing conclusions.",
      es: "Una persona musculada sale con sobrepeso por IMC. Por eso la guía lo combina con la ratio cintura-altura o una estimación de grasa antes de concluir nada.",
    },
  },
  {
    area: "body",
    level: 3,
    prompt: {
      en: "A natural ceiling for FFMI is around…",
      es: "Un techo natural del FFMI ronda…",
    },
    options: [
      { en: "15", es: "15" },
      { en: "25", es: "25" },
      { en: "40", es: "40" },
      { en: "There is no known ceiling", es: "No hay techo conocido" },
    ],
    answer: 1,
    why: {
      en: "Fat-free mass index normalizes lean mass to height; values near 25 mark the upper edge seen in drug-free lifters, which is why the calculator flags higher readings.",
      es: "El índice de masa libre de grasa normaliza la masa magra a la estatura; valores cerca de 25 marcan el límite superior visto en atletas naturales, por eso la calculadora señala lecturas mayores.",
    },
  },
  {
    area: "body",
    level: 4,
    prompt: {
      en: "For a body-fat estimate from tape, measurements are most reliable when taken…",
      es: "Para estimar la grasa con cinta, las medidas son más fiables cuando se toman…",
    },
    options: [
      {
        en: "Mornings, relaxed, same spots every week",
        es: "Por la mañana, relajado, en los mismos puntos cada semana",
      },
      {
        en: "Right after training, flexed, for a clear outline",
        es: "Justo después de entrenar, en tensión, para ver el contorno",
      },
      {
        en: "Over clothes, once, to set a baseline",
        es: "Sobre la ropa, una sola vez, como referencia",
      },
      {
        en: "Only the waist, since the rest never changes",
        es: "Solo la cintura, porque lo demás no cambia",
      },
    ],
    answer: 0,
    why: {
      en: "The estimate is only as good as the measurement. Consistency beats precision: the same conditions each week make the trend trustworthy even if the absolute number is off.",
      es: "La estimación vale lo que vale la medición. La constancia gana a la precisión: las mismas condiciones cada semana hacen fiable la tendencia aunque el número absoluto no sea exacto.",
    },
  },
  {
    area: "fundamentals",
    level: 1,
    prompt: {
      en: "One kilogram is about…",
      es: "Un kilogramo equivale a unas…",
    },
    options: [
      { en: "1 pound", es: "1 libra" },
      { en: "2.2 pounds", es: "2.2 libras" },
      { en: "5 pounds", es: "5 libras" },
      { en: "0.5 pounds", es: "0.5 libras" },
    ],
    answer: 1,
    why: {
      en: "1 kg = 2.2046 lb. A 20 kg plate is a 45 lb plate, and a 100 kg squat is about 220 lb.",
      es: "1 kg = 2.2046 lb. Un disco de 20 kg es un disco de 45 lb, y una sentadilla de 100 kg son unas 220 lb.",
    },
  },
  {
    area: "fundamentals",
    level: 2,
    prompt: {
      en: "A 1RM calculator estimates your max from…",
      es: "Una calculadora de 1RM estima tu máximo a partir de…",
    },
    options: [
      {
        en: "A weight and the reps you did with it",
        es: "Un peso y las repeticiones que hiciste con él",
      },
      {
        en: "Your body weight and your height alone",
        es: "Solo tu peso corporal y tu estatura",
      },
      {
        en: "Your age, sex and training history",
        es: "Tu edad, sexo e historial de entrenamiento",
      },
      {
        en: "The number of sets you can finish in an hour",
        es: "Cuántas series terminas en una hora",
      },
    ],
    answer: 0,
    why: {
      en: "Formulas like Epley and Brzycki project a submaximal set to a single-rep max. They are accurate within a few percent up to about ten reps.",
      es: "Fórmulas como Epley y Brzycki proyectan una serie submáxima a un máximo de una repetición. Son precisas dentro de un pequeño porcentaje hasta unas diez repeticiones.",
    },
  },
  {
    area: "fundamentals",
    level: 3,
    prompt: {
      en: "The recovery guide's sleep target for someone training hard is…",
      es: "El objetivo de sueño de la guía de recuperación para quien entrena fuerte es…",
    },
    options: [
      { en: "4 to 5 hours", es: "De 4 a 5 horas" },
      { en: "7 to 9 hours", es: "De 7 a 9 horas" },
      { en: "12 hours", es: "12 horas" },
      {
        en: "Sleep does not affect training",
        es: "El sueño no afecta al entreno",
      },
    ],
    answer: 1,
    why: {
      en: "Short sleep lowers strength, raises appetite and slows muscle repair. The guide treats sleep as the first recovery tool, before any supplement.",
      es: "Dormir poco baja la fuerza, aumenta el apetito y frena la reparación muscular. La guía trata el sueño como la primera herramienta de recuperación, antes que cualquier suplemento.",
    },
  },
  {
    area: "fundamentals",
    level: 4,
    prompt: {
      en: "Epley: 1RM ≈ weight × (1 + reps / 30). For 100 kg × 5 reps the estimate is about…",
      es: "Epley: 1RM ≈ peso × (1 + reps / 30). Para 100 kg × 5 repeticiones la estimación ronda…",
    },
    options: [
      { en: "105 kg", es: "105 kg" },
      { en: "117 kg", es: "117 kg" },
      { en: "150 kg", es: "150 kg" },
      { en: "200 kg", es: "200 kg" },
    ],
    answer: 1,
    why: {
      en: "100 × (1 + 5/30) = 100 × 1.167 ≈ 117 kg. The calculator shows several formulas because they diverge as reps climb.",
      es: "100 × (1 + 5/30) = 100 × 1.167 ≈ 117 kg. La calculadora muestra varias fórmulas porque divergen cuando suben las repeticiones.",
    },
  },
  {
    area: "nutrition",
    level: 1,
    prompt: {
      en: "Which of these is mostly protein?",
      es: "¿Cuál de estos es sobre todo proteína?",
    },
    options: [
      { en: "Grilled chicken breast", es: "Pechuga de pollo a la plancha" },
      { en: "A bowl of white rice", es: "Un plato de arroz blanco" },
      { en: "A spoon of olive oil", es: "Una cucharada de aceite de oliva" },
      { en: "A ripe banana with honey", es: "Un plátano maduro con miel" },
    ],
    answer: 0,
    why: {
      en: "Chicken breast is almost all protein with little fat; rice is carbohydrate, oil is fat and a banana is mostly sugar and water.",
      es: "La pechuga de pollo es casi toda proteína con poca grasa; el arroz es carbohidrato, el aceite es grasa y el plátano es sobre todo azúcar y agua.",
    },
  },
  {
    area: "nutrition",
    level: 2,
    prompt: {
      en: "Dietary fibre matters mainly because it…",
      es: "La fibra importa sobre todo porque…",
    },
    options: [
      {
        en: "Feeds gut bacteria and slows digestion",
        es: "Alimenta a las bacterias del intestino y frena la digestión",
      },
      {
        en: "Adds extra calories to every meal",
        es: "Suma calorías extra a cada comida",
      },
      {
        en: "Builds muscle like protein does",
        es: "Construye músculo igual que la proteína",
      },
      {
        en: "Replaces most of the water you need to drink",
        es: "Sustituye la mayor parte del agua que necesitas beber",
      },
    ],
    answer: 0,
    why: {
      en: "Fibre is not absorbed as energy; it feeds the gut microbiome, slows the rise of blood sugar and keeps you full. Around 25 to 35 g a day is the usual target.",
      es: "La fibra no se absorbe como energía; alimenta a la microbiota, frena la subida de azúcar en sangre y sacia. Unos 25 a 35 g al día es el objetivo habitual.",
    },
  },
  {
    area: "nutrition",
    level: 3,
    prompt: {
      en: "Refeeds or diet breaks in a long cut are used to…",
      es: "Los refeeds o pausas de dieta en una definición larga sirven para…",
    },
    options: [
      {
        en: "Restore training quality and ease adherence",
        es: "Recuperar calidad de entreno y facilitar la adherencia",
      },
      {
        en: "Reset the metabolism permanently in one day",
        es: "Reiniciar el metabolismo de forma permanente en un día",
      },
      {
        en: "Undo the fat loss so you can start again",
        es: "Deshacer la pérdida de grasa para empezar de nuevo",
      },
      {
        en: "Replace protein with carbohydrate for a week",
        es: "Sustituir la proteína por carbohidrato una semana",
      },
    ],
    answer: 0,
    why: {
      en: "A few days at maintenance refill glycogen, lift mood and training quality and make a long deficit easier to keep. They do not permanently change metabolic rate.",
      es: "Unos días en mantenimiento rellenan el glucógeno, mejoran el ánimo y la calidad del entreno y hacen más llevadero un déficit largo. No cambian el metabolismo de forma permanente.",
    },
  },
  {
    area: "nutrition",
    level: 4,
    prompt: {
      en: "Next to the daily total, how much does meal timing matter for fat loss?",
      es: "Junto al total diario, ¿cuánto importa el horario de las comidas para perder grasa?",
    },
    options: [
      {
        en: "Very little; the daily total decides",
        es: "Muy poco; decide el total del día",
      },
      {
        en: "Anything eaten after 8 pm is stored as fat",
        es: "Lo que comes después de las 8 pm se guarda como grasa",
      },
      {
        en: "Breakfast must be the largest meal",
        es: "El desayuno debe ser la comida más grande",
      },
      {
        en: "Six small meals burn more than three",
        es: "Seis comidas pequeñas queman más que tres",
      },
    ],
    answer: 0,
    why: {
      en: "Body weight follows the calorie balance over days and weeks. Timing can help hunger, sleep and training, but it does not change how much fat is stored at the same intake.",
      es: "El peso sigue el balance calórico de días y semanas. El horario puede ayudar con el hambre, el sueño y el entreno, pero no cambia cuánta grasa se guarda con la misma ingesta.",
    },
  },
  {
    area: "training",
    level: 1,
    prompt: { en: "A superset is…", es: "Una superserie es…" },
    options: [
      {
        en: "Two exercises back to back, little rest",
        es: "Dos ejercicios seguidos, con poco descanso",
      },
      {
        en: "A set with more weight than the previous one",
        es: "Una serie con más peso que la anterior",
      },
      {
        en: "The last set of the whole session",
        es: "La última serie de toda la sesión",
      },
      {
        en: "A set done with a training partner",
        es: "Una serie hecha con un compañero",
      },
    ],
    answer: 0,
    why: {
      en: "A superset pairs two exercises with little or no rest between them, often opposing muscles, to save time. The weight of each set is unrelated.",
      es: "Una superserie encadena dos ejercicios con poco o ningún descanso entre ellos, a menudo de músculos opuestos, para ahorrar tiempo. El peso de cada serie no tiene que ver.",
    },
  },
  {
    area: "training",
    level: 2,
    prompt: {
      en: "Compound exercises are the ones that…",
      es: "Los ejercicios compuestos son los que…",
    },
    options: [
      {
        en: "Move several joints at once",
        es: "Mueven varias articulaciones a la vez",
      },
      {
        en: "Use a machine instead of free weights",
        es: "Usan máquina en vez de peso libre",
      },
      { en: "Combine cardio with weights", es: "Combinan cardio con pesas" },
      {
        en: "Are done with both arms together",
        es: "Se hacen con los dos brazos a la vez",
      },
    ],
    answer: 0,
    why: {
      en: "Squats, presses, rows and deadlifts move more than one joint and train several muscles per set, which is why they anchor most programs. Isolation moves one joint.",
      es: "Sentadillas, presses, remos y pesos muertos mueven más de una articulación y entrenan varios músculos por serie; por eso sostienen casi todos los programas. Los de aislamiento mueven una.",
    },
  },
  {
    area: "training",
    level: 3,
    prompt: {
      en: "Autoregulating a session with RPE means…",
      es: "Autorregular una sesión con RPE significa…",
    },
    options: [
      {
        en: "Setting the load by how the sets feel today",
        es: "Ajustar la carga según cómo se sienten las series hoy",
      },
      {
        en: "Following the planned weights no matter what",
        es: "Seguir los pesos planeados pase lo que pase",
      },
      {
        en: "Skipping the session whenever you feel tired",
        es: "Saltar la sesión cada vez que te sientas cansado",
      },
      {
        en: "Doing as many sets as time allows",
        es: "Hacer tantas series como permita el tiempo",
      },
    ],
    answer: 0,
    why: {
      en: "RPE or RIR targets let the day's load rise or fall with readiness: a bad night of sleep lowers it, a strong day raises it, while the planned effort stays the same.",
      es: "Los objetivos de RPE o RIR dejan que la carga del día suba o baje con tu estado: una mala noche la baja, un día fuerte la sube, y el esfuerzo planeado se mantiene.",
    },
  },
  {
    area: "training",
    level: 4,
    prompt: {
      en: "Why is a strength gain judged relative to the previous load rather than in plain kilos?",
      es: "¿Por qué una ganancia de fuerza se juzga relativa a la carga anterior y no en kilos planos?",
    },
    options: [
      {
        en: "5 kg means more on a light lift than a heavy one",
        es: "5 kg significan más en un levantamiento ligero que en uno pesado",
      },
      {
        en: "Heavier lifters always progress faster in kilos",
        es: "Los más fuertes siempre progresan más rápido en kilos",
      },
      {
        en: "Plain kilos only count on the competition platform",
        es: "Los kilos planos solo cuentan en la tarima de competición",
      },
      {
        en: "Light lifts cannot be measured in whole kilos at all",
        es: "Los levantamientos ligeros no se pueden medir en kilos enteros",
      },
    ],
    answer: 0,
    why: {
      en: "Progress is a percentage of what you already lift: 5 kg on 60 kg is over 8 percent, on 120 kg it is about 4. That is why programs add smaller steps as the lift gets heavier.",
      es: "El progreso es un porcentaje de lo que ya levantas: 5 kg sobre 60 son más del 8 por ciento, sobre 120 unos 4. Por eso los programas añaden pasos más pequeños cuanto más pesado es el levantamiento.",
    },
  },
  {
    area: "body",
    level: 1,
    prompt: {
      en: "Where is the waist measured for a body-fat estimate?",
      es: "¿Dónde se mide la cintura para estimar la grasa corporal?",
    },
    options: [
      { en: "At the navel, relaxed", es: "A la altura del ombligo, relajado" },
      {
        en: "At the narrowest point, breathing in",
        es: "En el punto más estrecho, tomando aire",
      },
      {
        en: "Just under the ribs, flexed",
        es: "Justo bajo las costillas, en tensión",
      },
      {
        en: "Over the hip bones, standing",
        es: "Sobre los huesos de la cadera, de pie",
      },
    ],
    answer: 0,
    why: {
      en: "Navy-style estimates measure the waist at navel height, relaxed, not sucked in. The point matters less than taking it the same way every time.",
      es: "Las estimaciones tipo Navy miden la cintura a la altura del ombligo, relajado, sin meter la panza. Importa menos el punto exacto que medir igual cada vez.",
    },
  },
  {
    area: "body",
    level: 2,
    prompt: {
      en: "A smart scale's body-fat number is best treated as…",
      es: "El porcentaje de grasa de una báscula inteligente conviene tomarlo como…",
    },
    options: [
      {
        en: "A trend to watch, not an exact value",
        es: "Una tendencia que seguir, no un valor exacto",
      },
      { en: "Accurate to one decimal place", es: "Exacto hasta un decimal" },
      {
        en: "Useless under any circumstances",
        es: "Inútil en cualquier circunstancia",
      },
      {
        en: "More reliable than a tape measure",
        es: "Más fiable que una cinta métrica",
      },
    ],
    answer: 0,
    why: {
      en: "Impedance scales guess body fat from how current passes through you, which swings with hydration and meals. Same time, same conditions, and watch the direction over weeks.",
      es: "Las básculas de impedancia adivinan la grasa por cómo pasa la corriente, que cambia con la hidratación y las comidas. Misma hora, mismas condiciones, y mira la dirección a lo largo de semanas.",
    },
  },
  {
    area: "body",
    level: 3,
    prompt: {
      en: "FFMI (fat-free mass index) is useful because it…",
      es: "El FFMI (índice de masa libre de grasa) es útil porque…",
    },
    options: [
      {
        en: "Scales lean mass to height, unlike BMI",
        es: "Relaciona la masa magra con la estatura, a diferencia del IMC",
      },
      {
        en: "Measures body fat with no tape or caliper",
        es: "Mide la grasa sin cinta ni plicómetro",
      },
      {
        en: "Predicts your 1RM from your weight",
        es: "Predice tu 1RM a partir de tu peso",
      },
      {
        en: "Tells you how much water you hold",
        es: "Te dice cuánta agua retienes",
      },
    ],
    answer: 0,
    why: {
      en: "FFMI divides lean mass by height squared, so two people of different heights can be compared on muscle, which BMI cannot do because it lumps fat and muscle together.",
      es: "El FFMI divide la masa magra entre la estatura al cuadrado, así que dos personas de distinta altura se comparan en músculo, algo que el IMC no puede hacer porque mezcla grasa y músculo.",
    },
  },
  {
    area: "body",
    level: 4,
    prompt: {
      en: "A week into a new cut the weekly average fell 1.5 kg. Most of that is…",
      es: "A la semana de empezar una definición el promedio bajó 1,5 kg. La mayor parte es…",
    },
    options: [
      {
        en: "Mostly water and glycogen, not fat yet",
        es: "Sobre todo agua y glucógeno, todavía no grasa",
      },
      {
        en: "Fat, since the deficit is working",
        es: "Grasa, porque el déficit funciona",
      },
      {
        en: "Muscle lost from eating less protein",
        es: "Músculo perdido por comer menos proteína",
      },
      {
        en: "A scale error that will correct itself",
        es: "Un error de báscula que se corrige solo",
      },
    ],
    answer: 0,
    why: {
      en: "Fewer carbohydrates and less sodium drop stored glycogen and the water bound to it in the first days. Judge fat loss from week two onwards, by the trend.",
      es: "Menos carbohidratos y menos sodio bajan el glucógeno almacenado y el agua que lo acompaña en los primeros días. Juzga la pérdida de grasa a partir de la segunda semana, por la tendencia.",
    },
  },
  {
    area: "fundamentals",
    level: 1,
    prompt: {
      en: "Resting heart rate is best taken…",
      es: "La frecuencia cardíaca en reposo se toma mejor…",
    },
    options: [
      {
        en: "In the morning, before getting out of bed",
        es: "Por la mañana, antes de salir de la cama",
      },
      {
        en: "Right after climbing the stairs",
        es: "Justo después de subir escaleras",
      },
      {
        en: "During the first set of the workout",
        es: "Durante la primera serie del entreno",
      },
      {
        en: "After a strong coffee at breakfast",
        es: "Después de un café cargado en el desayuno",
      },
    ],
    answer: 0,
    why: {
      en: "Resting heart rate means at rest: lying down, before coffee, movement or stress. Taken the same way each day it is a cheap signal of recovery.",
      es: "La frecuencia en reposo es eso, en reposo: acostado, antes del café, de moverte o del estrés. Tomada igual cada día es una señal barata de recuperación.",
    },
  },
  {
    area: "fundamentals",
    level: 2,
    prompt: {
      en: "A deficit of about 500 kcal a day leads to roughly…",
      es: "Un déficit de unas 500 kcal al día lleva a más o menos…",
    },
    options: [
      {
        en: "Half a kilo of fat loss per week",
        es: "Medio kilo de grasa menos por semana",
      },
      {
        en: "Two kilos of fat loss per week",
        es: "Dos kilos de grasa menos por semana",
      },
      {
        en: "No change until the second month",
        es: "Ningún cambio hasta el segundo mes",
      },
      {
        en: "Five kilos lost in the first week",
        es: "Cinco kilos menos la primera semana",
      },
    ],
    answer: 0,
    why: {
      en: "A kilo of body fat holds about 7,000 kcal, so 500 kcal a day, 3,500 a week, works out near half a kilo. Real weeks vary with water, but the average follows that math.",
      es: "Un kilo de grasa corporal guarda unas 7.000 kcal, así que 500 al día, 3.500 a la semana, dan cerca de medio kilo. Las semanas reales varían con el agua, pero el promedio sigue esa cuenta.",
    },
  },
  {
    area: "fundamentals",
    level: 3,
    prompt: {
      en: "Heart-rate zones are usually set from…",
      es: "Las zonas de frecuencia cardíaca suelen fijarse a partir de…",
    },
    options: [
      {
        en: "A share of your maximum heart rate",
        es: "Un porcentaje de tu frecuencia cardíaca máxima",
      },
      {
        en: "Your body weight and your height",
        es: "Tu peso corporal y tu estatura",
      },
      {
        en: "The speed shown on the treadmill",
        es: "La velocidad que marca la cinta",
      },
      {
        en: "How hard the session feels afterwards",
        es: "Lo duro que se siente la sesión después",
      },
    ],
    answer: 0,
    why: {
      en: "Zones are bands of your maximum heart rate (or heart-rate reserve), with the max estimated from age or measured. Speed and body size do not define them.",
      es: "Las zonas son franjas de tu frecuencia máxima (o de la reserva cardíaca), con el máximo estimado por edad o medido. La velocidad y el tamaño corporal no las definen.",
    },
  },
  {
    area: "fundamentals",
    level: 4,
    prompt: {
      en: "Brzycki and Epley give different 1RM estimates for the same set. The sensible way to use them is…",
      es: "Brzycki y Epley dan 1RM distintos para la misma serie. Lo sensato es usarlos…",
    },
    options: [
      {
        en: "As a range, checked against real top sets",
        es: "Como un rango, contrastado con series pesadas reales",
      },
      {
        en: "Average them and treat that as exact",
        es: "Promediarlos y tratar ese número como exacto",
      },
      {
        en: "Trust Epley; Brzycki is outdated",
        es: "Fiarse de Epley; Brzycki está desfasada",
      },
      {
        en: "Ignore both and only test true maxes",
        es: "Ignorar ambas y solo probar máximos reales",
      },
    ],
    answer: 0,
    why: {
      en: "Every formula is a fit to a sample of lifters; the spread between them is the honest error bar. Use the range to set working loads and let heavy sets confirm it.",
      es: "Cada fórmula es un ajuste a una muestra de levantadores; la diferencia entre ellas es el margen de error honesto. Usa el rango para fijar cargas y deja que las series pesadas lo confirmen.",
    },
  },
];
