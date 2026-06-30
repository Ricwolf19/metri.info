import type { Locale } from "@/lib/i18n/config";

/**
 * The glossary — a single source of truth for the technical terms used across
 * calculators, docs and the site. Each entry is bilingual and links to the
 * guides where the concept is covered, so readers can jump from a highlighted
 * term straight to a definition (and from there to the full guide).
 *
 * `id` is the anchor used by the <Term> component (`/docs/glossary#<id>`).
 */
type L = Record<Locale, string>;

export type GlossaryTerm = {
  id: string;
  term: L;
  def: L;
  /** Related doc slugs (content/docs/{locale}/<slug>.mdx). */
  related?: string[];
};

export const localize = (value: L, locale: Locale): string => value[locale];

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "bmr",
    term: { en: "BMR", es: "TMB" },
    def: {
      en: "Basal Metabolic Rate — calories your body burns at complete rest to keep you alive.",
      es: "Tasa Metabólica Basal — calorías que tu cuerpo quema en reposo total para mantenerte con vida.",
    },
    related: ["bmr-tdee-guide", "tdee"],
  },
  {
    id: "tdee",
    term: { en: "TDEE", es: "TDEE" },
    def: {
      en: "Total Daily Energy Expenditure — all the calories you burn in a day, including activity. Your maintenance level.",
      es: "Gasto Energético Diario Total — todas las calorías que quemas al día, incluida la actividad. Tu nivel de mantenimiento.",
    },
    related: ["bmr-tdee-guide", "personalizing-your-diet"],
  },
  {
    id: "maintenance",
    term: { en: "Maintenance calories", es: "Calorías de mantenimiento" },
    def: {
      en: "The intake at which your weight stays stable — equal to your TDEE.",
      es: "La ingesta con la que tu peso se mantiene estable — igual a tu TDEE.",
    },
    related: ["personalizing-your-diet"],
  },
  {
    id: "deficit",
    term: { en: "Calorie deficit", es: "Déficit calórico" },
    def: {
      en: "Eating fewer calories than you burn, so the body uses stored energy and you lose weight.",
      es: "Comer menos calorías de las que quemas, así el cuerpo usa energía almacenada y pierdes peso.",
    },
    related: ["personalizing-your-diet"],
  },
  {
    id: "surplus",
    term: { en: "Calorie surplus", es: "Superávit calórico" },
    def: {
      en: "Eating more calories than you burn — needed to gain muscle and weight.",
      es: "Comer más calorías de las que quemas — necesario para ganar músculo y peso.",
    },
    related: ["personalizing-your-diet"],
  },
  {
    id: "macros",
    term: { en: "Macros", es: "Macros" },
    def: {
      en: "Macronutrients — protein, carbohydrates and fat, the three nutrients that supply calories.",
      es: "Macronutrientes — proteína, carbohidratos y grasa, los tres nutrientes que aportan calorías.",
    },
    related: ["macros", "macros-calculator-guide"],
  },
  {
    id: "protein",
    term: { en: "Protein", es: "Proteína" },
    def: {
      en: "The macronutrient that builds and repairs muscle. Lifters target ~1.6–2.2 g per kg of bodyweight.",
      es: "El macronutriente que construye y repara músculo. Quienes entrenan apuntan a ~1.6–2.2 g por kg de peso.",
    },
    related: ["macros"],
  },
  {
    id: "bmi",
    term: { en: "BMI", es: "IMC" },
    def: {
      en: "Body Mass Index — weight relative to height. A population screening tool, not a body-composition measure.",
      es: "Índice de Masa Corporal — peso en relación a la altura. Herramienta de cribado poblacional, no mide composición corporal.",
    },
    related: ["bmi-healthy-weight"],
  },
  {
    id: "body-fat",
    term: { en: "Body fat %", es: "% de grasa corporal" },
    def: {
      en: "The proportion of your bodyweight that is fat. Better than BMI for assessing composition.",
      es: "La proporción de tu peso que es grasa. Mejor que el IMC para evaluar composición.",
    },
    related: ["body-fat-guide"],
  },
  {
    id: "navy-method",
    term: { en: "Navy method", es: "Método Navy" },
    def: {
      en: "A body-fat estimate from circumference measurements (neck, waist, and hips for women).",
      es: "Una estimación de grasa corporal a partir de circunferencias (cuello, cintura y cadera en mujeres).",
    },
    related: ["body-fat-guide"],
  },
  {
    id: "ffmi",
    term: { en: "FFMI", es: "FFMI" },
    def: {
      en: "Fat-Free Mass Index — lean mass relative to height. A way to gauge muscularity independent of fat.",
      es: "Índice de Masa Libre de Grasa — masa magra en relación a la altura. Mide musculatura independiente de la grasa.",
    },
    related: ["ffmi-guide"],
  },
  {
    id: "lean-mass",
    term: { en: "Lean body mass", es: "Masa magra" },
    def: {
      en: "Everything in your body that isn't fat — muscle, bone, organs and water.",
      es: "Todo en tu cuerpo que no es grasa — músculo, hueso, órganos y agua.",
    },
    related: ["ffmi-guide", "body-fat-guide"],
  },
  {
    id: "one-rep-max",
    term: { en: "1RM (one-rep max)", es: "1RM (repetición máxima)" },
    def: {
      en: "The most weight you can lift for a single rep of an exercise. Estimated from submaximal sets.",
      es: "El máximo peso que puedes levantar en una sola repetición. Se estima a partir de series submáximas.",
    },
    related: ["one-rep-max-guide", "progressive-overload"],
  },
  {
    id: "progressive-overload",
    term: { en: "Progressive overload", es: "Sobrecarga progresiva" },
    def: {
      en: "Gradually increasing the demands on a muscle (weight, reps or sets) to keep driving adaptation.",
      es: "Aumentar gradualmente la demanda sobre un músculo (peso, reps o series) para seguir provocando adaptación.",
    },
    related: ["progressive-overload"],
  },
  {
    id: "hypertrophy",
    term: { en: "Hypertrophy", es: "Hipertrofia" },
    def: {
      en: "Muscle growth — an increase in the size of muscle fibers from training.",
      es: "Crecimiento muscular — un aumento del tamaño de las fibras musculares por el entrenamiento.",
    },
    related: ["volume-frequency", "progressive-overload"],
  },
  {
    id: "volume",
    term: { en: "Volume", es: "Volumen" },
    def: {
      en: "Total work done — usually counted as hard sets per muscle per week.",
      es: "Trabajo total realizado — normalmente se cuenta como series efectivas por músculo por semana.",
    },
    related: ["volume-frequency"],
  },
  {
    id: "frequency",
    term: { en: "Frequency", es: "Frecuencia" },
    def: {
      en: "How often you train a muscle or movement per week.",
      es: "Con qué frecuencia entrenas un músculo o movimiento por semana.",
    },
    related: ["volume-frequency"],
  },
  {
    id: "rir",
    term: { en: "RIR", es: "RIR" },
    def: {
      en: "Reps in reserve — how many reps you stop short of failure. A way to gauge effort.",
      es: "Repeticiones en reserva — cuántas reps te quedan antes del fallo. Una forma de medir el esfuerzo.",
    },
    related: ["training-intensity"],
  },
  {
    id: "failure",
    term: { en: "Failure", es: "Fallo" },
    def: {
      en: "The point where you can't complete another rep with good form.",
      es: "El punto donde no puedes completar otra repetición con buena técnica.",
    },
    related: ["training-intensity"],
  },
  {
    id: "rom",
    term: { en: "ROM", es: "ROM" },
    def: {
      en: "Range of motion — how far a joint travels during a rep. Full ROM generally builds more muscle.",
      es: "Rango de movimiento — cuánto se desplaza una articulación en una repetición. El ROM completo suele construir más músculo.",
    },
    related: ["lifting-technique"],
  },
  {
    id: "tut",
    term: { en: "TUT", es: "TUT" },
    def: {
      en: "Time under tension — how long a muscle is loaded during a set (~20–40 s).",
      es: "Tiempo bajo tensión — cuánto tiempo está cargado un músculo durante una serie (~20–40 s).",
    },
    related: ["lifting-technique"],
  },
  {
    id: "met",
    term: { en: "MET", es: "MET" },
    def: {
      en: "Metabolic equivalent — a measure of an activity's intensity used to estimate calories burned.",
      es: "Equivalente metabólico — una medida de la intensidad de una actividad para estimar calorías quemadas.",
    },
    related: ["tdee"],
  },
  {
    id: "wilks-dots",
    term: { en: "Wilks / DOTS", es: "Wilks / DOTS" },
    def: {
      en: "Scores that compare powerlifting totals across bodyweights, so lifters of different sizes can be ranked fairly.",
      es: "Puntuaciones que comparan totales de powerlifting entre pesos corporales, para clasificar de forma justa a personas de distinto tamaño.",
    },
    related: ["one-rep-max-guide"],
  },
];
