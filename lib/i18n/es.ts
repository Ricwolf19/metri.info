/**
 * Spanish strings — must provide every key from `en.ts`.
 */
import type { TranslationKey } from "./en";

export const es: Record<TranslationKey, string> = {
  // Common
  "common.continue": "Continuar",
  "common.learnMore": "Saber más",
  "common.readMore": "Leer más",
  "common.comingSoon": "Próximamente",
  "common.openSource": "Código abierto",
  "common.search": "Buscar",
  "common.loading": "Cargando…",

  // Languages
  "lang.en": "Inglés",
  "lang.es": "Español",

  // Theme
  "theme.title": "Apariencia",
  "theme.system": "Sistema",
  "theme.light": "Claro",
  "theme.dark": "Oscuro",

  // Navigation
  "nav.home": "Inicio",
  "nav.docs": "Docs",
  "nav.tools": "Herramientas",
  "nav.exercises": "Ejercicios",
  "nav.programs": "Programas",
  "nav.download": "Descargar",
  "nav.signIn": "Iniciar sesión",
  "nav.signUp": "Registrarse",
  "nav.github": "GitHub",
  "nav.menu": "Menú",
  "nav.close": "Cerrar",

  // Hero
  "hero.badge": "Tracker de fitness de código abierto",
  "hero.title": "Mide. Progresa. Evoluciona.",
  "hero.subtitle":
    "El compañero de entrenamiento de código abierto para lifters serios: calculadoras, programas y una base de conocimiento, gratis y privado por diseño.",
  "hero.ctaDownload": "Descargar app",
  "hero.ctaDocs": "Ver documentación",
  "hero.ctaTools": "Probar las calculadoras",

  // App showcase
  "showcase.badge": "App móvil",
  "showcase.title": "Toda tu vida de entrenamiento,",
  "showcase.highlight": "sin conexión primero.",
  "showcase.subtitle":
    "METRI funciona totalmente en tu dispositivo. Sin cuenta, sin que tus datos salgan del teléfono.",
  "showcase.feature1": "Calculadoras instantáneas que responden a cada tecla",
  "showcase.feature2":
    "Funciona 100% sin conexión — tus datos se quedan contigo",
  "showcase.feature3":
    "Fotos de progreso, recordatorios y programas estructurados",
  "showcase.feature4": "Gratis y de código abierto, para siempre",

  // Tools / calculators directory
  "tools.title": "Calculadoras y herramientas",
  "tools.subtitle":
    "Las mismas fórmulas que la app — al instante en tu navegador. Comparte resultados con un enlace.",
  "tools.bmr.title": "TMB y GET",
  "tools.bmr.desc":
    "Estima tu gasto energético diario (Harris-Benedict, Mifflin-St Jeor, Katch-McArdle).",
  "tools.macros.title": "Reparto de macros",
  "tools.macros.desc":
    "Objetivos de proteína, carbohidratos y grasa según tus calorías y meta.",
  "tools.onerm.title": "Calculadora de 1RM",
  "tools.onerm.desc":
    "Estima tu repetición máxima (Epley, Brzycki) desde cualquier serie.",
  "tools.bodyfat.title": "Grasa corporal",
  "tools.bodyfat.desc":
    "Método de circunferencias de la Marina de EE. UU. para el % de grasa.",
  "tools.ideal.title": "Peso saludable e IMC",
  "tools.ideal.desc": "Tu IMC y el rango de peso saludable de la OMS.",
  "tools.ffmi.title": "FFMI",
  "tools.ffmi.desc": "Índice de masa libre de grasa — cuánto músculo llevas.",
  "tools.water.title": "Hidratación",
  "tools.water.desc": "Objetivo diario de agua según peso y actividad.",
  "tools.plates.title": "Calculadora de discos",
  "tools.plates.desc":
    "Qué discos cargar en la barra para cualquier peso objetivo.",

  // Calculator UI
  "calc.weight": "Peso",
  "calc.reps": "Reps",
  "calc.height": "Altura",
  "calc.age": "Edad",
  "calc.sex": "Sexo",
  "calc.male": "Hombre",
  "calc.female": "Mujer",
  "calc.activity": "Nivel de actividad",
  "calc.formula": "Fórmula",
  "calc.result": "Resultado",
  "calc.share": "Copiar enlace",
  "calc.copied": "Enlace copiado",
  // Campos de calculadora
  "calc.bodyFat": "Grasa corporal",
  "calc.neck": "Cuello",
  "calc.waist": "Cintura",
  "calc.hip": "Cadera",
  "calc.calories": "Calorías",
  "calc.goalLabel": "Meta",
  "calc.targetWeight": "Peso objetivo",
  "calc.barWeight": "Peso de la barra",
  // Opciones de actividad
  "activity.sedentary": "Sedentario",
  "activity.light": "Ligero",
  "activity.moderate": "Moderado",
  "activity.active": "Activo",
  "activity.veryActive": "Muy activo",
  // Opciones de meta
  "calc.goal.cut": "Definición",
  "calc.goal.maintain": "Mantenimiento",
  "calc.goal.bulk": "Volumen",
  // Opciones de fórmula
  "calc.formula.epley": "Epley",
  "calc.formula.brzycki": "Brzycki",
  "calc.formula.mifflin": "Mifflin-St Jeor",
  "calc.formula.harris": "Harris-Benedict",
  "calc.formula.katch": "Katch-McArdle",
  // Etiquetas de resultado
  "calc.result.oneRm": "1RM estimado",
  "calc.result.tdee": "Mantenimiento (TDEE)",
  "calc.result.bmr": "TMB",
  "calc.result.cut": "Déficit suave (−500)",
  "calc.result.bulk": "Volumen limpio (+300)",
  "calc.result.protein": "Proteína",
  "calc.result.carbs": "Carbohidratos",
  "calc.result.fat": "Grasa",
  "calc.result.bodyFat": "Grasa corporal",
  "calc.result.bmi": "IMC",
  "calc.result.healthyRange": "Peso saludable",
  "calc.result.ffmi": "FFMI normalizado",
  "calc.result.ffmiRaw": "FFMI bruto",
  "calc.result.water": "Agua diaria",
  "calc.result.milliliters": "Mililitros",
  "calc.result.cups": "Vasos (~240 ml)",
  "calc.result.perSide": "Por lado",
  // Categorías de IMC
  "calc.bmi.underweight": "Bajo peso",
  "calc.bmi.normal": "Peso normal",
  "calc.bmi.overweight": "Sobrepeso",
  "calc.bmi.obese": "Obesidad",
  // Categorías de grasa corporal
  "calc.bf.essential": "Grasa esencial",
  "calc.bf.athlete": "Atlético",
  "calc.bf.fitness": "Fitness",
  "calc.bf.average": "Medio",
  "calc.bf.high": "Alto",
  // Bandas de FFMI
  "calc.ffmi.below": "Bajo la media",
  "calc.ffmi.average": "Media",
  "calc.ffmi.aboveAverage": "Sobre la media",
  "calc.ffmi.excellent": "Excelente",
  "calc.ffmi.superior": "Superior",
  "calc.ffmi.suspicious": "Excepcional",
  // UI de la página de calculadora
  "calc.howTitle": "Cómo se calcula",
  "calc.interpretTitle": "Cómo leer tu resultado",
  "calc.faqTitle": "Preguntas frecuentes",
  "calc.relatedTitle": "Calculadoras relacionadas",

  // Docs preview
  "docs.title": "Base de conocimiento",
  "docs.subtitle":
    "Guías basadas en evidencia sobre nutrición, entrenamiento y recuperación — escritas para lifters, no clickbait.",
  "docs.searchPlaceholder": "Buscar en la documentación…",
  "docs.noResults": "Sin resultados.",
  "docs.readingTime": "{minutes} min de lectura",
  "docs.onThisPage": "En esta página",
  "docs.disclaimer":
    "Contenido educativo. No es consejo médico — consulta a un profesional para tu caso.",
  "docs.catNutrition": "Nutrición",
  "docs.catNutritionDesc":
    "Macros, calorías, timing de comidas e hidratación — lo que de verdad mueve la composición corporal.",
  "docs.catTraining": "Entrenamiento",
  "docs.catTrainingDesc":
    "Sobrecarga progresiva, RIR/RPE, landmarks de volumen y cómo programar para crecer.",
  "docs.catRecovery": "Recuperación",
  "docs.catRecoveryDesc":
    "Sueño, descargas y gestión de la fatiga para que el entrenamiento cunda.",
  // Etiquetas de categoría de la base de conocimiento
  "docs.category.gettingStarted": "Primeros pasos",
  "docs.category.nutrition": "Nutrición",
  "docs.category.training": "Entrenamiento",
  "docs.category.recovery": "Recuperación",

  // CTAs de inicio
  "home.toolsCta": "Ver todas las calculadoras",
  "home.docsCta": "Explorar la base de conocimiento",

  // Marcador "próximamente"
  "soon.badge": "Próximamente",
  "soon.body":
    "Esta sección se está construyendo y llegará en una próxima versión.",
  "soon.backHome": "Volver al inicio",

  // Open-source CTA
  "oss.title": "Construido en abierto.",
  "oss.subtitle":
    "METRI tiene licencia MIT y es gratis para siempre. Dale una estrella, haz un fork o contribuye en GitHub.",
  "oss.cta": "Ver en GitHub",

  // Footer
  "footer.tagline": "Fitness de código abierto, hecho para lifters.",
  "footer.product": "Producto",
  "footer.resources": "Recursos",
  "footer.company": "Empresa",
  "footer.about": "Acerca de",
  "footer.privacy": "Privacidad",
  "footer.terms": "Términos",
  "footer.rights": "Todos los derechos reservados.",
  "footer.builtWith": "Gratis y de código abierto.",
  "footer.siteSource": "Código del sitio",

  // Download page
  "download.title": "Lleva METRI en tu teléfono",
  "download.subtitle": "Gratis, sin conexión primero, sin cuenta.",
  "download.ios": "Descargar en el App Store",
  "download.android": "Disponible en Google Play",
  "download.scan": "Escanea para descargar",
  // Estado en desarrollo
  "download.devBadge": "En desarrollo",
  "download.devTitle": "La app de METRI está por llegar",
  "download.devBody":
    "Estamos dando los últimos toques a la app móvil. Las versiones de iOS y Android llegan pronto — mientras tanto, todas las calculadoras ya funcionan aquí en la web.",
  "download.devCtaTools": "Usar las calculadoras web",
  "download.devCtaGithub": "Sigue el avance en GitHub",
  "download.platformsTitle": "Dónde la encontrarás",
  "download.iosSoon": "App Store — próximamente",
  "download.androidSoon": "Google Play — próximamente",
  "download.notifyNote":
    "Dale una estrella al repo para enterarte cuando salga la primera versión.",
};
