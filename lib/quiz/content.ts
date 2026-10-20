import type { QuizArea } from "@/lib/quiz/areas";

/**
 * The knowledge quiz bank. The first sixteen questions are the mobile app's
 * bank verbatim (`src/features/quiz/content.ts`); the rest add two more
 * questions per (area, level), the third set lifted from the knowledge base,
 * so a retake is not a repeat. Bilingual copy sits
 * beside the data (content-module convention; these are not UI strings).
 * Levels run basic (1) → pro (4); `answer` is the index into `options`.
 *
 * Invariant the tests hold: every (area, level) cell has at least one
 * question, every question has exactly four options and a `why` in both
 * languages.
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
      { en: "A unit of energy", es: "Una unidad de energía" },
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
      { en: "0.3 g/kg", es: "0,3 g/kg" },
      { en: "1.6 g/kg", es: "1,6 g/kg" },
      { en: "6 g/kg", es: "6 g/kg" },
      { en: "Protein does not matter", es: "La proteína no importa" },
    ],
    answer: 1,
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
      { en: "Calories eaten in a day", es: "Las calorías comidas en un día" },
      {
        en: "Energy left after training, relative to lean mass",
        es: "La energía que queda tras entrenar, respecto a la masa magra",
      },
      { en: "How awake you feel", es: "Qué despierto te sientes" },
      {
        en: "The glycemic index of a meal",
        es: "El índice glucémico de una comida",
      },
    ],
    answer: 1,
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
        en: "A group of reps before resting",
        es: "Un grupo de repeticiones antes de descansar",
      },
      { en: "A week of workouts", es: "Una semana de entrenamientos" },
      { en: "A machine setting", es: "Un ajuste de máquina" },
      { en: "A warm-up stretch", es: "Un estiramiento de calentamiento" },
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
      { en: "2 reps done", es: "2 repeticiones hechas" },
      { en: "2 reps left in reserve", es: "2 repeticiones en reserva" },
      { en: "Rest 2 minutes", es: "Descansar 2 minutos" },
      { en: "2 exercises combined", es: "2 ejercicios combinados" },
    ],
    answer: 1,
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
        en: "Switching programs every week",
        es: "Cambiar de rutina cada semana",
      },
      {
        en: "Training to failure every set",
        es: "Llegar al fallo en cada serie",
      },
      {
        en: "Gradually increasing the demand over time",
        es: "Aumentar la demanda poco a poco con el tiempo",
      },
      { en: "Deloading every session", es: "Hacer descarga en cada sesión" },
    ],
    answer: 2,
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
        es: "En las series largas la técnica se fatiga antes que la fuerza",
      },
      {
        en: "High reps build no strength",
        es: "Las repeticiones altas no dan fuerza",
      },
      {
        en: "1RM math only works below 5 reps",
        es: "El cálculo del 1RM solo sirve bajo 5 repes",
      },
      {
        en: "They do not; both are equally reliable",
        es: "No es así: ambas son igual de fiables",
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
      { en: "Weight and height", es: "Peso y altura" },
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
      { en: "Bone density", es: "Densidad ósea" },
      { en: "Abdominal fat gain", es: "Ganancia de grasa abdominal" },
      { en: "Muscle in the arms", es: "Músculo en los brazos" },
      { en: "Water in the skin", es: "Agua en la piel" },
    ],
    answer: 1,
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
      { en: "A skinfold caliper only", es: "Solo un pliegue cutáneo" },
      {
        en: "An electrical impedance scan",
        es: "Un escáner de impedancia eléctrica",
      },
      { en: "A blood test", es: "Un análisis de sangre" },
      {
        en: "Tape measurements (height, neck, waist…)",
        es: "Medidas con cinta (altura, cuello, cintura…)",
      },
    ],
    answer: 3,
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
        en: "It cannot; the scale is exact",
        es: "No puede: la báscula es exacta",
      },
      {
        en: "Muscle and stored fuel add non-fat weight (water, glycogen)",
        es: "El músculo y el combustible almacenado añaden peso que no es grasa (agua, glucógeno)",
      },
      {
        en: "Fat always weighs more than muscle",
        es: "La grasa siempre pesa más que el músculo",
      },
      {
        en: "Scales drift upward over time",
        es: "Las básculas suben solas con el tiempo",
      },
    ],
    answer: 1,
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
      { en: "Burn calories", es: "Quemar calorías" },
      {
        en: "Prepare tissues and the nervous system",
        es: "Preparar los tejidos y el sistema nervioso",
      },
      {
        en: "Stretch every muscle to the max",
        es: "Estirar cada músculo al máximo",
      },
      { en: "Make you sweat", es: "Hacerte sudar" },
    ],
    answer: 1,
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
        en: "Lactic acid stuck in the muscle",
        es: "Ácido láctico atrapado en el músculo",
      },
      {
        en: "Unaccustomed loading the body is not used to",
        es: "Un esfuerzo al que el cuerpo no está acostumbrado",
      },
      { en: "Not enough stretching after", es: "No estirar después" },
      { en: "A pulled muscle", es: "Una distensión muscular" },
    ],
    answer: 1,
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
      { en: "Training until sick", es: "Entrenar hasta marearte" },
      {
        en: "No more reps possible with good form",
        es: "No puedes hacer más repeticiones con buena técnica",
      },
      { en: "Skipping the warm-up", es: "Saltarte el calentamiento" },
      { en: "Finishing the program", es: "Terminar la rutina" },
    ],
    answer: 1,
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
      { en: "To learn new exercises", es: "Para aprender ejercicios nuevos" },
      {
        en: "Because muscles need a week of rest",
        es: "Porque los músculos necesitan una semana de descanso",
      },
      {
        en: "Fatigue fades faster than fitness, so capacity rebounds",
        es: "La fatiga se disipa antes que la forma, así la capacidad se recupera",
      },
      { en: "They are only for beginners", es: "Son solo para principiantes" },
    ],
    answer: 2,
    why: {
      en: "Fatigue builds and fades faster than fitness. An easier week lets it clear while the fitness stays, so performance rebounds afterwards.",
      es: "La fatiga se acumula y se disipa más rápido que la forma física. Una semana más ligera la deja bajar mientras la forma se mantiene, y el rendimiento repunta después.",
    },
  },
  // --- Second bank: one more question per cell ------------------------------
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
      { en: "One large serving at dinner", es: "Una ración grande en la cena" },
      {
        en: "Three to five meals with a solid portion each",
        es: "De tres a cinco comidas con una porción sólida en cada una",
      },
      {
        en: "Protein only on training days",
        es: "Proteína solo los días de entreno",
      },
      { en: "A shake every hour", es: "Un batido cada hora" },
    ],
    answer: 1,
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
        en: "One week of daily weigh-ins",
        es: "Una semana de pesajes diarios",
      },
      { en: "The TDEE formula alone", es: "La fórmula del TDEE por sí sola" },
      {
        en: "Two to three weeks of stable weekly weight averages",
        es: "Dos o tres semanas de promedios semanales de peso estables",
      },
      { en: "How hungry you feel", es: "Cuánta hambre sientes" },
    ],
    answer: 2,
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
      { en: "The metabolism breaks", es: "El metabolismo se rompe" },
      {
        en: "A lighter body and lower daily movement shrink the deficit",
        es: "Un cuerpo más ligero y menos movimiento diario reducen el déficit",
      },
      {
        en: "Carbohydrates stop being digested",
        es: "Los carbohidratos dejan de digerirse",
      },
      {
        en: "Fat turns into water weight",
        es: "La grasa se convierte en agua",
      },
    ],
    answer: 1,
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
        en: "A group of movements done in a row",
        es: "Un grupo de movimientos seguidos",
      },
      { en: "The rest between exercises", es: "El descanso entre ejercicios" },
      { en: "A warm-up set", es: "Una serie de calentamiento" },
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
      { en: "You need even more sets", es: "Necesitas aún más series" },
      {
        en: "You passed what you can recover from; cut volume and rebuild",
        es: "Pasaste lo que puedes recuperar; baja el volumen y reconstruye",
      },
      {
        en: "You should switch to cardio only",
        es: "Deberías pasar solo a cardio",
      },
      { en: "Your protein is too high", es: "Tu proteína es demasiado alta" },
    ],
    answer: 1,
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
      { en: "Height and age", es: "Estatura y edad" },
      { en: "Fat mass and lean mass", es: "Masa grasa y masa magra" },
      { en: "Steps and sleep", es: "Pasos y sueño" },
      { en: "Water and bone only", es: "Solo agua y hueso" },
    ],
    answer: 1,
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
      { en: "A single morning weight", es: "Un solo peso por la mañana" },
      {
        en: "The weekly weight average plus a waist measurement",
        es: "El promedio semanal de peso más la medida de cintura",
      },
      { en: "Daily photos only", es: "Solo fotos diarias" },
      {
        en: "A smart scale's body-fat reading",
        es: "El porcentaje de grasa de una báscula inteligente",
      },
    ],
    answer: 1,
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
      { en: "Nothing; only BMI matters", es: "Nada; solo importa el IMC" },
      {
        en: "Central fat worth addressing, whatever the BMI says",
        es: "Grasa central que conviene atender, diga lo que diga el IMC",
      },
      { en: "You are underweight", es: "Que tienes bajo peso" },
      { en: "Too much muscle", es: "Demasiado músculo" },
    ],
    answer: 1,
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
        en: "Day-to-day weight swings",
        es: "Las oscilaciones diarias del peso",
      },
      {
        en: "Strength trends and waist measurements over weeks",
        es: "Las tendencias de fuerza y las medidas de cintura a lo largo de semanas",
      },
      { en: "How much you sweat", es: "Cuánto sudas" },
      { en: "Your step count", es: "Tu conteo de pasos" },
    ],
    answer: 1,
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
      { en: "Only exercise", es: "Solo el ejercicio" },
      {
        en: "BMR plus daily activity, exercise and digestion",
        es: "El BMR más la actividad diaria, el ejercicio y la digestión",
      },
      {
        en: "Only the calories food costs to digest",
        es: "Solo las calorías que cuesta digerir la comida",
      },
      {
        en: "The calories burned while sleeping",
        es: "Las calorías quemadas al dormir",
      },
    ],
    answer: 1,
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
        en: "When you do not want to enter any data",
        es: "Cuando no quieres introducir ningún dato",
      },
      {
        en: "When you know your body-fat percentage with some confidence",
        es: "Cuando conoces tu porcentaje de grasa con cierta confianza",
      },
      {
        en: "When you train more than three days a week",
        es: "Cuando entrenas más de tres días por semana",
      },
      {
        en: "When you are under thirty",
        es: "Cuando tienes menos de treinta años",
      },
    ],
    answer: 1,
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
      { en: "The watch is always right", es: "El reloj siempre tiene razón" },
      {
        en: "Every one of them estimates with error; only the weight trend validates the number",
        es: "Todos estiman con error; solo la tendencia del peso valida el número",
      },
      { en: "Formulas ignore your age", es: "Las fórmulas ignoran tu edad" },
      {
        en: "Apps measure body fat directly",
        es: "Las apps miden la grasa directamente",
      },
    ],
    answer: 1,
    why: {
      en: "Each tool models you differently and none measures what you actually burn. Pick one, hold it steady and let two or three weeks of the scale trend correct it.",
      es: "Cada herramienta te modela distinto y ninguna mide lo que realmente gastas. Elige una, mantenla fija y deja que dos o tres semanas de tendencia del peso la corrijan.",
    },
  },

  // --- Third bank: questions the knowledge base answers directly ------------
  {
    area: "nutrition",
    level: 1,
    prompt: {
      en: "A practical daily water baseline from the hydration guide is…",
      es: "Una referencia diaria práctica de agua según la guía de hidratación es…",
    },
    options: [
      { en: "About 1 glass", es: "Alrededor de 1 vaso" },
      {
        en: "Around 30 to 35 ml per kg of body weight, more when you sweat",
        es: "Entre 30 y 35 ml por kg de peso, más si sudas",
      },
      { en: "Exactly 8 litres", es: "Exactamente 8 litros" },
      {
        en: "Only what thirst asks for during training",
        es: "Solo lo que pida la sed durante el entreno",
      },
    ],
    answer: 1,
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
      { en: "Counting only calories", es: "Contar solo calorías" },
      {
        en: "Logging protein, carbohydrate and fat in grams against daily targets",
        es: "Registrar proteína, carbohidrato y grasa en gramos frente a objetivos diarios",
      },
      {
        en: "Avoiding all carbohydrates",
        es: "Evitar todos los carbohidratos",
      },
      {
        en: "Weighing yourself after every meal",
        es: "Pesarte después de cada comida",
      },
    ],
    answer: 1,
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
      { en: "Only before training, 20 g", es: "Solo antes de entrenar, 20 g" },
      {
        en: "3 to 5 g every day, no cycling needed",
        es: "De 3 a 5 g todos los días, sin ciclarla",
      },
      { en: "Once a week", es: "Una vez por semana" },
      { en: "Only during a bulk", es: "Solo en volumen" },
    ],
    answer: 1,
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
      { en: "Protein, down by half", es: "La proteína, a la mitad" },
      {
        en: "Calories, by roughly 5 to 10 percent, keeping protein",
        es: "Las calorías, entre un 5 y un 10 por ciento, manteniendo la proteína",
      },
      { en: "Water intake", es: "El agua" },
      {
        en: "Nothing; wait two more months",
        es: "Nada; esperar dos meses más",
      },
    ],
    answer: 1,
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
      { en: "1 to 2 hard sets", es: "De 1 a 2 series efectivas" },
      { en: "10 to 20 hard sets", es: "De 10 a 20 series efectivas" },
      { en: "50 or more sets", es: "50 series o más" },
      { en: "It does not matter", es: "No importa" },
    ],
    answer: 1,
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
        en: "3 sets, 1 rep, 1 minute rest",
        es: "3 series, 1 repetición, 1 minuto de descanso",
      },
      {
        en: "3 s lowering, 1 s pause, 1 s lifting",
        es: "3 s bajando, 1 s de pausa, 1 s subiendo",
      },
      { en: "3 exercises, 1 round, 1 day", es: "3 ejercicios, 1 ronda, 1 día" },
      {
        en: "3 warm-ups, 1 work set, 1 drop set",
        es: "3 calentamientos, 1 serie efectiva, 1 serie descendente",
      },
    ],
    answer: 1,
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
      { en: "It burns more calories", es: "Quema más calorías" },
      {
        en: "Each set is fresher, so quality and total load per week go up",
        es: "Cada serie llega más fresca, así que suben la calidad y la carga total semanal",
      },
      {
        en: "Muscles only grow on two days",
        es: "Los músculos solo crecen dos días",
      },
      {
        en: "One session is illegal in competitions",
        es: "Una sola sesión está prohibida en competición",
      },
    ],
    answer: 1,
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
      { en: "Muscle weighs more", es: "El músculo pesa más" },
      { en: "Fat weighs more", es: "La grasa pesa más" },
      {
        en: "Take exactly the same space",
        es: "Ocupan exactamente el mismo espacio",
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
      { en: "Needs a blood test", es: "Necesita un análisis de sangre" },
      {
        en: "Cannot tell muscle from fat",
        es: "No distingue músculo de grasa",
      },
      { en: "Only works for women", es: "Solo funciona en mujeres" },
      { en: "Changes every hour", es: "Cambia cada hora" },
    ],
    answer: 1,
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
        en: "Right after training, flexed",
        es: "Justo después de entrenar, en tensión",
      },
      {
        en: "In the morning, relaxed, at the same spots every week",
        es: "Por la mañana, relajado, en los mismos puntos cada semana",
      },
      { en: "Over clothes, once", es: "Sobre la ropa, una sola vez" },
      { en: "Only the waist", es: "Solo la cintura" },
    ],
    answer: 1,
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
      { en: "Your body weight alone", es: "Solo tu peso corporal" },
      {
        en: "A weight and the reps you did with it",
        es: "Un peso y las repeticiones que hiciste con él",
      },
      { en: "Your age and height", es: "Tu edad y estatura" },
      { en: "The number of sets", es: "El número de series" },
    ],
    answer: 1,
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
];
