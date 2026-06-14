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
  "showcase.feature2": "Funciona 100% sin conexión — tus datos se quedan contigo",
  "showcase.feature3": "Fotos de progreso, recordatorios y programas estructurados",
  "showcase.feature4": "Gratis y de código abierto, para siempre",

  // Tools / calculators directory
  "tools.title": "Calculadoras y herramientas",
  "tools.subtitle":
    "Las mismas fórmulas que la app — al instante en tu navegador. Comparte resultados con un enlace.",
  "tools.bmr.title": "TMB y GET",
  "tools.bmr.desc": "Estima tu gasto energético diario (Harris-Benedict, Mifflin-St Jeor, Katch-McArdle).",
  "tools.macros.title": "Reparto de macros",
  "tools.macros.desc": "Objetivos de proteína, carbohidratos y grasa según tus calorías y meta.",
  "tools.onerm.title": "Calculadora de 1RM",
  "tools.onerm.desc": "Estima tu repetición máxima (Epley, Brzycki) desde cualquier serie.",
  "tools.bodyfat.title": "Grasa corporal",
  "tools.bodyfat.desc": "Método de circunferencias de la Marina de EE. UU. para el % de grasa.",
  "tools.ideal.title": "Peso saludable e IMC",
  "tools.ideal.desc": "Tu IMC y el rango de peso saludable de la OMS.",
  "tools.ffmi.title": "FFMI",
  "tools.ffmi.desc": "Índice de masa libre de grasa — cuánto músculo llevas.",
  "tools.water.title": "Hidratación",
  "tools.water.desc": "Objetivo diario de agua según peso y actividad.",
  "tools.plates.title": "Calculadora de discos",
  "tools.plates.desc": "Qué discos cargar en la barra para cualquier peso objetivo.",

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
