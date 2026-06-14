import type { Locale } from "@/lib/i18n/config";
import type { CalcId } from "./types";

export type CalcContent = {
  seoTitle: string;
  seoDescription: string;
  h1: string;
  tagline: string;
  about: string[];
  formula?: string;
  how: string[];
  interpret: string[];
  faq: { q: string; a: string }[];
};

export const CALC_CONTENT: Record<CalcId, Record<Locale, CalcContent>> = {
  onerm: {
    en: {
      seoTitle: "1RM Calculator — Estimate Your One-Rep Max",
      seoDescription:
        "Free 1RM calculator. Estimate your one-rep max from any weight and rep count using the Epley or Brzycki formula, with a full training-percentage table.",
      h1: "1RM Calculator",
      tagline:
        "Estimate your one-rep max from any set — no max-out attempt needed.",
      about: [
        "Your one-rep max (1RM) is the heaviest weight you can lift for a single rep. It's the reference point for programming intensity, but testing it directly is risky and fatiguing. This calculator estimates it from a set you've already done.",
      ],
      formula:
        "Epley:  1RM = weight × (1 + reps / 30)\nBrzycki: 1RM = weight × 36 / (37 − reps)",
      how: [
        "Enter the weight you lifted and the reps you completed, then pick a formula. Epley tends to read slightly higher at high reps; Brzycki is conservative and best under ~10 reps. The percentage table shows training loads derived from your estimate.",
      ],
      interpret: [
        "Use the estimate to set working weights — e.g. hypertrophy work often sits at 67–80% (8–12 reps), strength work at 85%+ (1–5 reps). Estimates get less accurate above ~10 reps, so base 1RM off sets of 5 or fewer when you can.",
      ],
      faq: [
        {
          q: "Which formula is most accurate?",
          a: "For low reps (≤5) Epley and Brzycki are very close. Brzycki is more conservative as reps climb; Epley slightly higher. Use the same formula consistently to track progress.",
        },
        {
          q: "How many reps should I use?",
          a: "Sets of 3–5 reps give the most reliable estimate. Above 10 reps, accuracy drops because endurance starts to dominate.",
        },
        {
          q: "Is it safe to skip maxing out?",
          a: "Yes — estimating from a submaximal set avoids the injury and fatigue risk of a true 1RM attempt, which is why most programs use estimated maxes.",
        },
      ],
    },
    es: {
      seoTitle: "Calculadora de 1RM — Estima tu repetición máxima",
      seoDescription:
        "Calculadora de 1RM gratis. Estima tu repetición máxima desde cualquier peso y número de reps con las fórmulas de Epley o Brzycki, con tabla de porcentajes.",
      h1: "Calculadora de 1RM",
      tagline:
        "Estima tu repetición máxima desde cualquier serie — sin intentar un máximo real.",
      about: [
        "Tu repetición máxima (1RM) es el peso más alto que puedes levantar una sola vez. Es la referencia para programar la intensidad, pero medirla directamente es arriesgado y fatigante. Esta calculadora la estima desde una serie que ya hiciste.",
      ],
      formula:
        "Epley:  1RM = peso × (1 + reps / 30)\nBrzycki: 1RM = peso × 36 / (37 − reps)",
      how: [
        "Introduce el peso que levantaste y las reps que completaste, y elige una fórmula. Epley tiende a dar algo más alto en reps altas; Brzycki es conservadora y mejor por debajo de ~10 reps. La tabla de porcentajes muestra cargas de entrenamiento derivadas de tu estimación.",
      ],
      interpret: [
        "Usa la estimación para fijar pesos de trabajo — la hipertrofia suele estar en 67–80% (8–12 reps) y la fuerza en 85%+ (1–5 reps). La precisión baja por encima de ~10 reps, así que estima el 1RM con series de 5 o menos cuando puedas.",
      ],
      faq: [
        {
          q: "¿Qué fórmula es más precisa?",
          a: "Con reps bajas (≤5) Epley y Brzycki son muy parecidas. Brzycki es más conservadora al subir las reps; Epley algo más alta. Usa siempre la misma para seguir tu progreso.",
        },
        {
          q: "¿Cuántas reps debo usar?",
          a: "Series de 3–5 reps dan la estimación más fiable. Por encima de 10 reps la precisión cae porque domina la resistencia.",
        },
        {
          q: "¿Es seguro no hacer el máximo real?",
          a: "Sí — estimar desde una serie submáxima evita el riesgo de lesión y fatiga de un 1RM real, por eso la mayoría de programas usan máximos estimados.",
        },
      ],
    },
  },

  tdee: {
    en: {
      seoTitle: "TDEE Calculator — Daily Calories & BMR",
      seoDescription:
        "Free TDEE calculator. Estimate your maintenance calories and BMR with the Mifflin-St Jeor, Harris-Benedict or Katch-McArdle formula, plus cut and bulk targets.",
      h1: "TDEE Calculator",
      tagline:
        "Find your maintenance calories — the foundation of any nutrition plan.",
      about: [
        "Your TDEE (total daily energy expenditure) is how many calories you burn in a day. It's your maintenance number: eat at it to stay the same, below it to lose fat, above it to gain. It starts from your BMR (resting burn) scaled by activity.",
      ],
      formula:
        "Mifflin-St Jeor:\nBMR = 10×kg + 6.25×cm − 5×age + (male +5 / female −161)\nTDEE = BMR × activity factor",
      how: [
        "Enter your stats and activity level. Mifflin-St Jeor is the modern default; Harris-Benedict is the classic; Katch-McArdle uses your body-fat % (most accurate if you know it). Your BMR is multiplied by an activity factor from 1.2 (sedentary) to 1.9 (very active).",
      ],
      interpret: [
        "Maintenance is a starting estimate, not a fixed truth — track weight for 2–3 weeks and adjust. The result also shows a ~500 kcal deficit (mild fat loss) and a ~300 kcal surplus (lean gain). Feed your target into the macro calculator to split it.",
      ],
      faq: [
        {
          q: "BMR vs TDEE — what's the difference?",
          a: "BMR is what you burn at complete rest. TDEE is BMR plus activity, digestion and movement — your real daily maintenance calories.",
        },
        {
          q: "Which formula should I pick?",
          a: "Mifflin-St Jeor for most people. Use Katch-McArdle if you have a reliable body-fat measurement, since it accounts for lean mass.",
        },
        {
          q: "Why isn't my weight matching the estimate?",
          a: "Formulas are population averages. Use the number as a starting point, then nudge calories based on 2–3 weeks of real scale data.",
        },
      ],
    },
    es: {
      seoTitle: "Calculadora de TDEE — Calorías diarias y TMB",
      seoDescription:
        "Calculadora de TDEE gratis. Estima tus calorías de mantenimiento y TMB con Mifflin-St Jeor, Harris-Benedict o Katch-McArdle, con objetivos de déficit y volumen.",
      h1: "Calculadora de TDEE",
      tagline:
        "Encuentra tus calorías de mantenimiento — la base de cualquier plan.",
      about: [
        "Tu TDEE (gasto energético diario total) es cuántas calorías quemas en un día. Es tu número de mantenimiento: come en él para mantenerte, por debajo para perder grasa, por encima para ganar. Parte de tu TMB (gasto en reposo) escalada por actividad.",
      ],
      formula:
        "Mifflin-St Jeor:\nTMB = 10×kg + 6.25×cm − 5×edad + (hombre +5 / mujer −161)\nTDEE = TMB × factor de actividad",
      how: [
        "Introduce tus datos y nivel de actividad. Mifflin-St Jeor es la opción moderna por defecto; Harris-Benedict la clásica; Katch-McArdle usa tu % de grasa (la más precisa si lo conoces). Tu TMB se multiplica por un factor de 1.2 (sedentario) a 1.9 (muy activo).",
      ],
      interpret: [
        "El mantenimiento es una estimación inicial, no una verdad fija — sigue tu peso 2–3 semanas y ajusta. El resultado también muestra un déficit de ~500 kcal (pérdida suave) y un superávit de ~300 kcal (ganancia limpia). Pasa tu objetivo a la calculadora de macros.",
      ],
      faq: [
        {
          q: "TMB vs TDEE — ¿cuál es la diferencia?",
          a: "La TMB es lo que quemas en reposo absoluto. El TDEE es la TMB más actividad, digestión y movimiento — tus calorías reales de mantenimiento.",
        },
        {
          q: "¿Qué fórmula elijo?",
          a: "Mifflin-St Jeor para la mayoría. Usa Katch-McArdle si tienes una medición fiable de grasa corporal, porque considera la masa magra.",
        },
        {
          q: "¿Por qué mi peso no coincide con la estimación?",
          a: "Las fórmulas son promedios poblacionales. Úsala como punto de partida y ajusta calorías según 2–3 semanas de datos reales de la báscula.",
        },
      ],
    },
  },

  macros: {
    en: {
      seoTitle: "Macro Calculator — Protein, Carbs & Fat",
      seoDescription:
        "Free macro calculator. Turn your daily calories into protein, carb and fat targets based on your goal and bodyweight, with the math explained.",
      h1: "Macro Calculator",
      tagline:
        "Split your calories into protein, carbs and fat that fit your goal.",
      about: [
        "Macros are where your calories come from. This calculator sets protein from your bodyweight and goal, fat as a share of calories for hormones, and fills the rest with carbs — your main training fuel.",
      ],
      formula:
        "protein = g/kg × bodyweight\nfat = 25% of calories ÷ 9\ncarbs = (calories − protein×4 − fat×9) ÷ 4",
      how: [
        "Enter your daily calories (from the TDEE calculator), your bodyweight and your goal. Protein scales with goal — 2.2 g/kg cutting, 2.0 maintaining, 1.8 bulking — fat is ~25% of calories, and carbs take the remainder.",
      ],
      interpret: [
        "Hit protein most reliably; carbs and fat have more flexibility. You don't need to nail grams exactly — land within ~5–10 g of protein and keep calories in range, and body composition will follow.",
      ],
      faq: [
        {
          q: "How much protein do I need?",
          a: "Roughly 1.8–2.2 g per kg of bodyweight depending on goal. More in a deficit to protect muscle, slightly less in a surplus.",
        },
        {
          q: "Do carbs make you fat?",
          a: "No — total calories drive fat gain. Carbs are the main fuel for hard training; cutting them only matters via the calories they remove.",
        },
        {
          q: "Where do I get my calorie number?",
          a: "Use the TDEE calculator for maintenance, then adjust for your goal before entering it here.",
        },
      ],
    },
    es: {
      seoTitle: "Calculadora de Macros — Proteína, carbohidratos y grasa",
      seoDescription:
        "Calculadora de macros gratis. Convierte tus calorías diarias en objetivos de proteína, carbohidratos y grasa según tu meta y peso, con la matemática explicada.",
      h1: "Calculadora de Macros",
      tagline:
        "Reparte tus calorías en proteína, carbohidratos y grasa según tu meta.",
      about: [
        "Los macros son de donde salen tus calorías. Esta calculadora fija la proteína según tu peso y meta, la grasa como porcentaje de calorías para las hormonas, y rellena el resto con carbohidratos — tu principal combustible de entrenamiento.",
      ],
      formula:
        "proteína = g/kg × peso\ngrasa = 25% de calorías ÷ 9\ncarbos = (calorías − proteína×4 − grasa×9) ÷ 4",
      how: [
        "Introduce tus calorías diarias (de la calculadora de TDEE), tu peso y tu meta. La proteína escala con la meta — 2.2 g/kg en déficit, 2.0 en mantenimiento, 1.8 en volumen — la grasa es ~25% de las calorías y los carbohidratos toman el resto.",
      ],
      interpret: [
        "Cumple la proteína de forma fiable; carbohidratos y grasa tienen más margen. No necesitas clavar los gramos — quédate a ~5–10 g de proteína y mantén las calorías en rango, y la composición corporal acompañará.",
      ],
      faq: [
        {
          q: "¿Cuánta proteína necesito?",
          a: "Aproximadamente 1.8–2.2 g por kg de peso según la meta. Más en déficit para proteger músculo, algo menos en superávit.",
        },
        {
          q: "¿Los carbohidratos engordan?",
          a: "No — las calorías totales determinan la ganancia de grasa. Los carbohidratos son el combustible del entrenamiento duro; recortarlos solo cuenta por las calorías que quitan.",
        },
        {
          q: "¿De dónde saco mi número de calorías?",
          a: "Usa la calculadora de TDEE para el mantenimiento y ajústalo a tu meta antes de introducirlo aquí.",
        },
      ],
    },
  },

  bodyfat: {
    en: {
      seoTitle: "Body Fat Calculator — U.S. Navy Method",
      seoDescription:
        "Free body fat calculator using the U.S. Navy circumference method. Estimate your body-fat percentage from a few tape measurements — no calipers needed.",
      h1: "Body Fat Calculator",
      tagline:
        "Estimate body-fat percentage with a tape measure — the U.S. Navy method.",
      about: [
        "The U.S. Navy method estimates body-fat percentage from circumference measurements. It needs only a tape measure and gives a repeatable number that's great for tracking change over time.",
      ],
      formula:
        "Men: 495 / (1.0324 − 0.19077·log10(waist−neck) + 0.15456·log10(height)) − 450",
      how: [
        "Measure your neck, waist (and hips for women) in centimetres, relaxed, without compressing the skin. Enter them with your height and sex. Consistency matters more than perfection — measure the same way each time.",
      ],
      interpret: [
        "Treat the result as an estimate (±3–4%). What matters is the trend: a falling number on consistent measurements means you're losing fat. Categories range from essential fat through athletic, fitness, average and high.",
      ],
      faq: [
        {
          q: "How accurate is the Navy method?",
          a: "It's typically within 3–4% of more advanced methods like DEXA, and far more accurate for tracking change than a single body-fat scale reading.",
        },
        {
          q: "Where exactly do I measure?",
          a: "Neck just below the larynx; waist at the navel for men; waist at the narrowest point and hips at the widest for women. Keep the tape level and snug, not tight.",
        },
        {
          q: "Why does it ask for hips for women only?",
          a: "The female formula includes hip circumference to better account for fat distribution; the male formula does not need it.",
        },
      ],
    },
    es: {
      seoTitle: "Calculadora de Grasa Corporal — Método Marina de EE. UU.",
      seoDescription:
        "Calculadora de grasa corporal gratis con el método de circunferencias de la Marina de EE. UU. Estima tu % de grasa con unas medidas de cinta — sin plicómetro.",
      h1: "Calculadora de Grasa Corporal",
      tagline:
        "Estima el % de grasa con una cinta métrica — el método de la Marina de EE. UU.",
      about: [
        "El método de la Marina de EE. UU. estima el porcentaje de grasa a partir de medidas de circunferencia. Solo necesita una cinta métrica y da un número repetible, ideal para seguir el cambio en el tiempo.",
      ],
      formula:
        "Hombres: 495 / (1.0324 − 0.19077·log10(cintura−cuello) + 0.15456·log10(altura)) − 450",
      how: [
        "Mide cuello, cintura (y cadera en mujeres) en centímetros, relajado y sin comprimir la piel. Introdúcelas con tu altura y sexo. La constancia importa más que la perfección — mide igual cada vez.",
      ],
      interpret: [
        "Toma el resultado como estimación (±3–4%). Lo que importa es la tendencia: un número que baja con medidas consistentes significa que pierdes grasa. Las categorías van de grasa esencial a atlética, fitness, media y alta.",
      ],
      faq: [
        {
          q: "¿Qué precisión tiene el método Navy?",
          a: "Suele quedar dentro de un 3–4% de métodos avanzados como DEXA, y es mucho más fiable para seguir el cambio que una báscula de grasa.",
        },
        {
          q: "¿Dónde mido exactamente?",
          a: "Cuello justo bajo la laringe; cintura a la altura del ombligo en hombres; cintura en el punto más estrecho y cadera en el más ancho en mujeres. Cinta nivelada y ajustada, no apretada.",
        },
        {
          q: "¿Por qué pide cadera solo en mujeres?",
          a: "La fórmula femenina incluye la circunferencia de cadera para reflejar mejor la distribución de grasa; la masculina no la necesita.",
        },
      ],
    },
  },

  bmi: {
    en: {
      seoTitle: "BMI Calculator — Body Mass Index & Healthy Weight",
      seoDescription:
        "Free BMI calculator. Get your body mass index, your WHO weight category and your healthy-weight range from height and weight.",
      h1: "BMI Calculator",
      tagline:
        "Your body mass index and the healthy-weight range for your height.",
      about: [
        "Body Mass Index (BMI) is a quick screening number relating weight to height. It's not a measure of body composition, but it's a useful population-level reference and shows the healthy-weight range for your height.",
      ],
      formula: "BMI = weight(kg) / height(m)²",
      how: [
        "Enter your height and weight. The result places you in a WHO category — underweight (<18.5), normal (18.5–24.9), overweight (25–29.9) or obese (≥30) — and shows the weight range that keeps you in the healthy band.",
      ],
      interpret: [
        "BMI doesn't distinguish muscle from fat, so muscular lifters can read 'overweight' while lean. Use it as a rough guide alongside body-fat percentage and waist measurements, not as a verdict.",
      ],
      faq: [
        {
          q: "Is BMI accurate for athletes?",
          a: "Not reliably — muscle is dense, so trained lifters often score 'overweight' despite being lean. Pair BMI with body-fat % for a fuller picture.",
        },
        {
          q: "What's a healthy BMI?",
          a: "The WHO healthy range is 18.5–24.9. The calculator converts that into a weight range for your specific height.",
        },
        {
          q: "Does BMI differ by sex or age?",
          a: "The standard adult formula doesn't adjust for sex or age. Those factors matter for interpretation, which is why body composition is a better individual metric.",
        },
      ],
    },
    es: {
      seoTitle: "Calculadora de IMC — Índice de masa corporal y peso saludable",
      seoDescription:
        "Calculadora de IMC gratis. Obtén tu índice de masa corporal, tu categoría de peso de la OMS y tu rango de peso saludable a partir de altura y peso.",
      h1: "Calculadora de IMC",
      tagline:
        "Tu índice de masa corporal y el rango de peso saludable para tu altura.",
      about: [
        "El Índice de Masa Corporal (IMC) es un número rápido de cribado que relaciona peso y altura. No mide la composición corporal, pero es una referencia útil a nivel poblacional y muestra el rango de peso saludable para tu altura.",
      ],
      formula: "IMC = peso(kg) / altura(m)²",
      how: [
        "Introduce tu altura y peso. El resultado te sitúa en una categoría de la OMS — bajo peso (<18.5), normal (18.5–24.9), sobrepeso (25–29.9) u obesidad (≥30) — y muestra el rango de peso que te mantiene en la banda saludable.",
      ],
      interpret: [
        "El IMC no distingue músculo de grasa, así que un lifter musculado puede marcar 'sobrepeso' estando definido. Úsalo como guía aproximada junto al % de grasa y la cintura, no como un veredicto.",
      ],
      faq: [
        {
          q: "¿Es preciso el IMC para atletas?",
          a: "No de forma fiable — el músculo es denso, así que los lifters entrenados marcan 'sobrepeso' a menudo estando definidos. Combina el IMC con el % de grasa.",
        },
        {
          q: "¿Qué IMC es saludable?",
          a: "El rango saludable de la OMS es 18.5–24.9. La calculadora lo convierte en un rango de peso para tu altura concreta.",
        },
        {
          q: "¿El IMC cambia por sexo o edad?",
          a: "La fórmula estándar para adultos no ajusta por sexo ni edad. Esos factores importan para interpretar, por eso la composición corporal es mejor métrica individual.",
        },
      ],
    },
  },

  ffmi: {
    en: {
      seoTitle: "FFMI Calculator — Fat-Free Mass Index",
      seoDescription:
        "Free FFMI calculator. Estimate your fat-free mass index and see how much muscle you carry relative to your height — the lean alternative to BMI.",
      h1: "FFMI Calculator",
      tagline:
        "How much muscle you carry for your height — the lean version of BMI.",
      about: [
        "Fat-Free Mass Index (FFMI) is like BMI but for lean mass only. It tells you how much muscle you carry relative to height, and is popular for gauging muscular development and natural-physique potential.",
      ],
      formula:
        "fat-free mass = weight × (1 − bodyfat%)\nFFMI = FFM / height(m)²\nnormalized = FFMI + 6.1 × (1.8 − height_m)",
      how: [
        "Enter your weight, height and body-fat percentage (use the body-fat calculator if you don't know it). We compute fat-free mass, divide by height squared, then normalize to a 1.8 m reference so people of different heights can be compared.",
      ],
      interpret: [
        "For men, ~18–20 is average, 22–23 is excellent, and the mid-20s approach the natural ceiling; values much above ~25 are uncommon without exceptional genetics. Use it to track muscle gain, not as a hard limit.",
      ],
      faq: [
        {
          q: "What's a good FFMI?",
          a: "Around 18–20 is average for trained men, 22–23 is excellent, and ~25 is near the natural upper range. Women's reference values run lower.",
        },
        {
          q: "Why normalize FFMI?",
          a: "Normalizing to 1.8 m height removes the bias that taller people get higher raw scores, making comparisons fairer.",
        },
        {
          q: "Do I need an accurate body-fat number?",
          a: "Yes — FFMI is sensitive to body-fat input. Use a consistent method (e.g. the Navy estimate) so your trend is meaningful.",
        },
      ],
    },
    es: {
      seoTitle: "Calculadora de FFMI — Índice de masa libre de grasa",
      seoDescription:
        "Calculadora de FFMI gratis. Estima tu índice de masa libre de grasa y cuánto músculo llevas en relación a tu altura — la alternativa magra al IMC.",
      h1: "Calculadora de FFMI",
      tagline:
        "Cuánto músculo llevas para tu altura — la versión magra del IMC.",
      about: [
        "El Índice de Masa Libre de Grasa (FFMI) es como el IMC pero solo con masa magra. Indica cuánto músculo llevas en relación a la altura y es popular para valorar el desarrollo muscular y el potencial natural.",
      ],
      formula:
        "masa libre de grasa = peso × (1 − %grasa)\nFFMI = MLG / altura(m)²\nnormalizado = FFMI + 6.1 × (1.8 − altura_m)",
      how: [
        "Introduce tu peso, altura y porcentaje de grasa (usa la calculadora de grasa corporal si no lo sabes). Calculamos la masa libre de grasa, la dividimos por la altura al cuadrado y la normalizamos a una referencia de 1.8 m para poder comparar alturas distintas.",
      ],
      interpret: [
        "En hombres, ~18–20 es media, 22–23 es excelente y los 25 se acercan al techo natural; valores muy por encima de ~25 son raros sin genética excepcional. Úsalo para seguir la ganancia muscular, no como límite rígido.",
      ],
      faq: [
        {
          q: "¿Qué FFMI es bueno?",
          a: "En torno a 18–20 es media en hombres entrenados, 22–23 es excelente y ~25 es casi el tope natural. En mujeres los valores de referencia son menores.",
        },
        {
          q: "¿Por qué se normaliza el FFMI?",
          a: "Normalizar a 1.8 m de altura elimina el sesgo de que las personas más altas obtengan puntuaciones brutas mayores, haciendo más justa la comparación.",
        },
        {
          q: "¿Necesito un % de grasa preciso?",
          a: "Sí — el FFMI es sensible a ese dato. Usa un método consistente (p. ej. la estimación Navy) para que tu tendencia tenga sentido.",
        },
      ],
    },
  },

  water: {
    en: {
      seoTitle: "Water Intake Calculator — Daily Hydration",
      seoDescription:
        "Free water intake calculator. Estimate how much water to drink per day from your bodyweight and activity level, in litres, millilitres and cups.",
      h1: "Water Intake Calculator",
      tagline:
        "How much water to drink per day, based on your weight and activity.",
      about: [
        "Hydration affects performance, focus and recovery. This calculator estimates a daily water target from your bodyweight plus a bonus for how active you are.",
      ],
      formula: "ml = bodyweight(kg) × 35 + activity bonus",
      how: [
        "Enter your weight and activity level. The base is ~35 ml per kg of bodyweight, plus 0–1000 ml depending on activity. The result is shown in litres, millilitres and roughly-240 ml cups.",
      ],
      interpret: [
        "This is a baseline, not a hard rule — heat, sweat rate and diet all shift your needs. A simple field check: pale-straw urine usually means you're well hydrated.",
      ],
      faq: [
        {
          q: "Does coffee or tea count?",
          a: "Yes — fluids from drinks and water-rich foods all contribute. The target is total daily fluid, not plain water only.",
        },
        {
          q: "Can you drink too much water?",
          a: "Rarely, but chugging far beyond your needs in a short time can dilute sodium. Spread intake across the day.",
        },
        {
          q: "Should I drink more on training days?",
          a: "Yes — that's what the activity bonus accounts for. Add extra to replace heavy sweat losses in hot sessions.",
        },
      ],
    },
    es: {
      seoTitle: "Calculadora de Agua — Hidratación diaria",
      seoDescription:
        "Calculadora de agua gratis. Estima cuánta agua beber al día según tu peso y nivel de actividad, en litros, mililitros y vasos.",
      h1: "Calculadora de Agua",
      tagline: "Cuánta agua beber al día, según tu peso y actividad.",
      about: [
        "La hidratación afecta al rendimiento, la concentración y la recuperación. Esta calculadora estima un objetivo diario de agua a partir de tu peso más un extra según lo activo que seas.",
      ],
      formula: "ml = peso(kg) × 35 + extra por actividad",
      how: [
        "Introduce tu peso y nivel de actividad. La base es ~35 ml por kg de peso, más 0–1000 ml según la actividad. El resultado se muestra en litros, mililitros y vasos de ~240 ml.",
      ],
      interpret: [
        "Es una base, no una regla rígida — el calor, la sudoración y la dieta cambian tus necesidades. Una comprobación simple: una orina de color pajizo claro suele indicar buena hidratación.",
      ],
      faq: [
        {
          q: "¿Cuenta el café o el té?",
          a: "Sí — los líquidos de bebidas y alimentos ricos en agua suman. El objetivo es el líquido total diario, no solo agua pura.",
        },
        {
          q: "¿Se puede beber demasiada agua?",
          a: "Rara vez, pero beber muchísimo en poco tiempo puede diluir el sodio. Reparte la ingesta a lo largo del día.",
        },
        {
          q: "¿Debo beber más los días de entreno?",
          a: "Sí — eso refleja el extra por actividad. Añade más para reponer el sudor en sesiones calurosas.",
        },
      ],
    },
  },

  plates: {
    en: {
      seoTitle: "Plate Calculator — Barbell Loading",
      seoDescription:
        "Free barbell plate calculator. Enter a target weight and bar weight to see exactly which plates to load on each side.",
      h1: "Plate Calculator",
      tagline:
        "Which plates to load on each side of the bar for any target weight.",
      about: [
        "Stop doing barbell math mid-warmup. Enter your target total and bar weight and this shows the plates to put on each side, using standard kg plates.",
      ],
      formula: "per side = (target − bar) / 2, loaded heaviest-first",
      how: [
        "Enter the total weight you want on the bar and your bar's weight (20 kg Olympic by default). The calculator subtracts the bar, halves the rest, and greedily loads the largest plates first: 25, 20, 15, 10, 5, 2.5, 1.25 kg.",
      ],
      interpret: [
        "Each row is the plate and how many go on each side. If there's a remainder, your target isn't reachable with standard plates and the smaller increment — round to the nearest loadable weight.",
      ],
      faq: [
        {
          q: "What bar weight should I use?",
          a: "A standard Olympic barbell is 20 kg; women's bars are 15 kg and some technique bars are lighter. Set it to match your bar.",
        },
        {
          q: "What plates does it assume?",
          a: "Standard kilo plates: 25, 20, 15, 10, 5, 2.5 and 1.25 kg, loaded largest-first on each side.",
        },
        {
          q: "Why is there a remainder?",
          a: "Because your target can't be made exactly from the available plates per side. Adjust the target to the nearest loadable number.",
        },
      ],
    },
    es: {
      seoTitle: "Calculadora de Discos — Carga de barra",
      seoDescription:
        "Calculadora de discos gratis. Introduce un peso objetivo y el peso de la barra para ver exactamente qué discos cargar en cada lado.",
      h1: "Calculadora de Discos",
      tagline:
        "Qué discos cargar en cada lado de la barra para cualquier peso objetivo.",
      about: [
        "Deja de hacer cuentas en pleno calentamiento. Introduce tu peso total objetivo y el de la barra y verás los discos a poner en cada lado, con discos estándar en kg.",
      ],
      formula:
        "por lado = (objetivo − barra) / 2, cargando del más pesado primero",
      how: [
        "Introduce el peso total que quieres en la barra y el peso de tu barra (20 kg olímpica por defecto). La calculadora resta la barra, divide el resto a la mitad y carga los discos más grandes primero: 25, 20, 15, 10, 5, 2.5, 1.25 kg.",
      ],
      interpret: [
        "Cada fila es el disco y cuántos van en cada lado. Si queda un resto, tu objetivo no se alcanza con discos estándar y el incremento menor — redondea al peso cargable más cercano.",
      ],
      faq: [
        {
          q: "¿Qué peso de barra uso?",
          a: "La barra olímpica estándar pesa 20 kg; las de mujer 15 kg y algunas técnicas menos. Ajústalo a tu barra.",
        },
        {
          q: "¿Qué discos asume?",
          a: "Discos estándar en kilos: 25, 20, 15, 10, 5, 2.5 y 1.25 kg, cargando del más grande al más pequeño en cada lado.",
        },
        {
          q: "¿Por qué hay un resto?",
          a: "Porque tu objetivo no se puede formar exactamente con los discos disponibles por lado. Ajusta el objetivo al número cargable más cercano.",
        },
      ],
    },
  },
};
