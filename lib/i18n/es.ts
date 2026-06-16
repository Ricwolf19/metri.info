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
  "nav.signOut": "Cerrar sesión",
  "nav.admin": "Panel admin",
  "nav.github": "GitHub",
  "nav.contact": "Contacto",
  "nav.menu": "Menú",
  "nav.close": "Cerrar",

  // Auth
  "auth.signIn": "Iniciar sesión",
  "auth.signUp": "Crear cuenta",
  "auth.email": "Correo",
  "auth.password": "Contraseña",
  "auth.name": "Nombre",
  "auth.or": "o",
  "auth.continueGoogle": "Continuar con Google",
  "auth.continueGithub": "Continuar con GitHub",
  "auth.signInTitle": "Bienvenido de vuelta",
  "auth.signInSubtitle":
    "Inicia sesión para guardar tus resultados y sincronizar con la app.",
  "auth.signUpTitle": "Crea tu cuenta",
  "auth.signUpSubtitle":
    "Gratis para siempre. Guarda tus cálculos y tu progreso.",
  "auth.noAccount": "¿No tienes cuenta?",
  "auth.haveAccount": "¿Ya tienes cuenta?",
  "auth.createAccount": "Crea una",
  "auth.backHome": "Volver al inicio",
  "auth.errorGeneric": "Algo salió mal. Inténtalo de nuevo.",
  "auth.brandTitle": "Entrena con cabeza,",
  "auth.brandHighlight": "mide todo.",
  "auth.brandSubtitle":
    "Calculadoras, programas y guías de fitness gratis — tu cuenta mantiene tus resultados sincronizados.",

  // Hero
  "hero.badge": "Tracker de fitness de código abierto",
  "hero.title": "Mide. Progresa. Evoluciona.",
  "hero.subtitle":
    "El compañero de entrenamiento de código abierto para lifters serios: calculadoras, programas y una base de conocimiento, gratis y privado por diseño.",
  "hero.ctaDownload": "Descargar app",
  "hero.ctaDocs": "Ver documentación",
  "hero.ctaTools": "Probar las calculadoras",

  // App showcase
  "showcase.badge": "También en el móvil",
  "showcase.title": "¿Prefieres el teléfono?",
  "showcase.highlight": "Llévalo contigo.",
  "showcase.subtitle":
    "Todo en METRI es gratis en la web. Una app nativa está en camino como extra opcional — las mismas herramientas, sin conexión.",
  "showcase.feature1": "Calculadoras instantáneas que responden a cada tecla",
  "showcase.feature2":
    "Funciona 100% sin conexión — tus datos se quedan contigo",
  "showcase.feature3":
    "Fotos de progreso, recordatorios y programas estructurados",
  "showcase.feature4": "Gratis y de código abierto, para siempre",

  // Bento (propuestas de valor en la portada)
  "bento.eyebrow": "Por qué METRI",
  "bento.title": "Todo lo que un atleta necesita,",
  "bento.highlight": "gratis en la web.",
  "bento.subtitle":
    "Sin muros de pago, sin registro, sin relleno: herramientas de código abierto en las que puedes confiar de verdad. La app es solo un extra opcional.",
  "bento.calc.title": "8 calculadoras al instante",
  "bento.calc.desc":
    "1RM, TDEE, macros, grasa corporal, IMC, FFMI, hidratación y carga de discos — cada una con su gráfica visual y un enlace para compartir.",
  "bento.calc.cta": "Abrir las calculadoras",
  "bento.oss.title": "Código abierto para siempre",
  "bento.oss.desc":
    "Licencia MIT y desarrollo abierto. Lee las fórmulas, haz un fork, contribuye.",
  "bento.offline.title": "Funciona sin conexión",
  "bento.offline.desc":
    "La app nativa opcional ejecuta cada herramienta sin conexión — tus datos se quedan en el dispositivo.",
  "bento.docs.title": "Guías basadas en evidencia",
  "bento.docs.desc":
    "Una base de conocimiento en crecimiento sobre nutrición, entrenamiento y recuperación — escrita para atletas, no para clics.",
  "bento.docs.cta": "Explorar la documentación",
  "bento.privacy.title": "Privado por diseño",
  "bento.privacy.desc":
    "Las calculadoras funcionan en tu navegador. La cuenta es opcional y solo sincroniza lo que decidas guardar.",

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
  "calc.copied": "Copiado",
  "calc.shareCta": "Compartir resultado",
  "calc.shareTitle": "Comparte este resultado",
  "calc.shareDesc":
    "Cualquiera con el enlace ve los mismos datos y resultado — sin cuenta.",
  "calc.shareQrHint": "Escanea para abrirlo en tu teléfono",
  "calc.shareNative": "Compartir…",
  "calc.cardTitle": "Tarjeta de resultado",
  "calc.saveImage": "Descargar imagen",
  "calc.compare": "Comparar",
  "calc.compareExit": "Vista simple",
  "calc.scenarioA": "Escenario A",
  "calc.scenarioB": "Escenario B",
  "calc.difference": "Diferencia",
  "share.open": "Abrir la calculadora",
  "share.note":
    "Se calcula al instante en tu navegador — ábrela para cambiar los datos.",
  "calc.metric": "Métrico",
  "calc.imperial": "Imperial",
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
  "calc.eyebrow": "Calculadora gratis",
  "calc.overviewTitle": "Resumen",
  "calc.onThisPage": "En esta página",
  "calc.howTitle": "Cómo se calcula",
  "calc.interpretTitle": "Cómo leer tu resultado",
  "calc.faqTitle": "Preguntas frecuentes",
  "calc.relatedTitle": "Calculadoras relacionadas",
  "calc.trustTitle": "Gratis y de código abierto",
  "calc.trustBody":
    "Cada calculadora de METRI corre en tu navegador — sin cuenta, sin muros de pago, sin rastreo.",
  "calc.trustCta": "Ver todas las calculadoras",

  // Biblioteca de ejercicios
  "ex.title": "Biblioteca de ejercicios",
  "ex.subtitle":
    "Guías de técnica para los ejercicios que importan — músculos implicados, equipo y técnica paso a paso.",
  "ex.searchPlaceholder": "Buscar ejercicios…",
  "ex.allCategories": "Todos los grupos musculares",
  "ex.allEquipment": "Todo el equipo",
  "ex.noResults": "No se encontraron ejercicios.",
  "ex.instructions": "Cómo realizarlo",
  "ex.primaryMuscles": "Músculos primarios",
  "ex.secondaryMuscles": "Músculos secundarios",
  "ex.equipmentLabel": "Equipo",
  "ex.difficultyLabel": "Dificultad",
  "ex.cat.chest": "Pecho",
  "ex.cat.back": "Espalda",
  "ex.cat.legs": "Pierna",
  "ex.cat.shoulders": "Hombros",
  "ex.cat.arms": "Brazos",
  "ex.cat.core": "Core",
  "ex.eq.barbell": "Barra",
  "ex.eq.dumbbell": "Mancuerna",
  "ex.eq.machine": "Máquina",
  "ex.eq.cable": "Polea",
  "ex.eq.bodyweight": "Peso corporal",
  "ex.eq.kettlebell": "Kettlebell",
  "ex.diff.beginner": "Principiante",
  "ex.diff.intermediate": "Intermedio",
  "ex.diff.advanced": "Avanzado",

  // Músculos
  "muscle.chest": "Pecho",
  "muscle.upperBack": "Espalda alta",
  "muscle.lats": "Dorsales",
  "muscle.lowerBack": "Espalda baja",
  "muscle.traps": "Trapecios",
  "muscle.frontDelts": "Deltoides frontal",
  "muscle.sideDelts": "Deltoides lateral",
  "muscle.triceps": "Tríceps",
  "muscle.biceps": "Bíceps",
  "muscle.forearms": "Antebrazos",
  "muscle.quads": "Cuádriceps",
  "muscle.hamstrings": "Femorales",
  "muscle.glutes": "Glúteos",
  "muscle.calves": "Gemelos",
  "muscle.abs": "Abdominales",
  "muscle.obliques": "Oblicuos",
  "muscle.core": "Core",

  // Programas
  "program.title": "Programas de entrenamiento",
  "program.subtitle":
    "Rutinas estructuradas de varias semanas — elige una meta y sigue un plan probado.",
  "program.weeks": "{n} semanas",
  "program.daysPerWeek": "{n} días/semana",
  "program.day": "Día",
  "program.sets": "Series",
  "program.reps": "Reps",
  "program.exercisesTitle": "El plan",
  "program.featured": "Destacado",
  "program.goal.strength": "Fuerza",
  "program.goal.hypertrophy": "Hipertrofia",
  "program.goal.powerbuilding": "Powerbuilding",
  "program.goal.endurance": "Resistencia",

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
  // Homepage stat strip
  "stats.calculators": "Calculadoras gratis",
  "stats.private": "Corre en tu navegador",
  "stats.account": "Cuentas necesarias",
  "stats.license": "Código abierto (MIT)",

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
  "footer.calculators": "Calculadoras",
  "footer.tagline2":
    "Calculadoras y guías de fitness gratis y de código abierto — sin cuenta, sin muros de pago, hechas para lifters.",
  "footer.about": "Acerca de",
  "footer.privacy": "Privacidad",
  "footer.terms": "Términos",
  "footer.contact": "Contacto",
  "footer.rights": "Todos los derechos reservados.",
  "footer.builtWith": "Gratis y de código abierto.",
  "footer.builtBy": "Hecho por",
  "footer.siteSource": "Código del sitio",

  // Contact page
  "contact.title": "Hablemos",
  "contact.subtitle":
    "Dudas, comentarios, un error o una colaboración — envía un mensaje y llegará directo a mi bandeja de entrada.",
  "contact.nameLabel": "Nombre",
  "contact.emailLabel": "Correo",
  "contact.messageLabel": "Mensaje",
  "contact.namePlaceholder": "Tu nombre",
  "contact.emailPlaceholder": "tu@ejemplo.com",
  "contact.messagePlaceholder": "¿En qué puedo ayudarte?",
  "contact.submit": "Enviar mensaje",
  "contact.sending": "Enviando…",
  "contact.success":
    "¡Gracias! Tu mensaje va en camino — te responderé pronto.",
  "contact.sendAnother": "Enviar otro mensaje",
  "contact.developer": "Desarrollado y mantenido por",
  "contact.errorRequired": "Este campo es obligatorio.",
  "contact.errorName": "Escribe tu nombre.",
  "contact.errorNameLong": "Ese nombre es demasiado largo.",
  "contact.errorEmail": "Escribe un correo electrónico válido.",
  "contact.errorMessage": "Escribe al menos unas palabras.",
  "contact.errorMessageLong": "Ese mensaje es demasiado largo.",
  "contact.errorBot":
    "No pudimos verificar que eres humano. Inténtalo de nuevo.",
  "contact.errorGeneric": "No se pudo enviar tu mensaje. Inténtalo de nuevo.",
  "contact.recaptchaProtected":
    "Este sitio está protegido por reCAPTCHA y se aplican la",
  "contact.recaptchaPrivacy": "Política de Privacidad",
  "contact.recaptchaAnd": "y los",
  "contact.recaptchaTerms": "Términos de Servicio",
  "contact.recaptchaApply": "de Google.",

  // Download page
  "download.title": "Lleva METRI en tu teléfono",
  "download.subtitle": "Gratis, sin conexión primero, sin cuenta.",
  "download.ios": "Descargar en el App Store",
  "download.android": "Disponible en Google Play",
  "download.scan": "Escanea para descargar",
  // Estado en desarrollo
  "download.devBadge": "App móvil en desarrollo",
  "download.devTitle": "Una app nativa está en camino",
  "download.devBody":
    "METRI es gratis y de código abierto en la web — todas las calculadoras y guías, sin cuenta, para siempre. Una app nativa de iOS y Android está en desarrollo como extra opcional.",
  "download.devCtaTools": "Explorar las calculadoras",
  "download.devCtaGithub": "Sigue el avance en GitHub",
  "download.platformsTitle": "Llegará a",
  "download.iosSoon": "App Store — próximamente",
  "download.androidSoon": "Google Play — próximamente",
  "download.notifyNote":
    "Dale una estrella al repo para enterarte cuando salga la primera versión.",
};
