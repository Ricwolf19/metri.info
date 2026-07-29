import type { Locale } from "@/lib/i18n/config";

/** Manual, type-safe changelog. Add a release by prepending to `WEB_CHANGELOG`
 * (newest first). Each change is bilingual so EN and ES never drift. */
export type ChangeType = "added" | "improved" | "fixed";

type L = Record<Locale, string>;

export type ChangelogEntry = {
  version: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  title: L;
  changes: { type: ChangeType; text: L }[];
};

export const localize = (value: L, locale: Locale): string => value[locale];

export const WEB_CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.6.0",
    date: "2026-07-29",
    title: {
      en: "Android beta, a new converter and a faster site",
      es: "Beta de Android, nuevo conversor y un sitio más rápido",
    },
    changes: [
      {
        type: "added",
        text: {
          en: "The Android app is downloadable right now — grab the APK from the download page. It's a beta, so it installs manually and your phone will warn you; the page explains every step.",
          es: "La app de Android ya se puede descargar — obtén el APK desde la página de descarga. Es una beta, así que se instala manualmente y tu teléfono te mostrará advertencias; la página explica cada paso.",
        },
      },
      {
        type: "added",
        text: {
          en: "New lb ↔ kg converter, with one-tap presets for the plate and barbell loads you actually use.",
          es: "Nuevo conversor lb ↔ kg, con valores rápidos para las cargas de discos y barra que de verdad usas.",
        },
      },
      {
        type: "improved",
        text: {
          en: "Calculators no longer hit the network as you drag a slider — the shareable link still updates, it just stopped costing a round-trip per keystroke.",
          es: "Las calculadoras ya no hacen peticiones mientras mueves un slider — el enlace para compartir se sigue actualizando, solo dejó de costar una petición por cada cambio.",
        },
      },
      {
        type: "improved",
        text: {
          en: "Pages you've already opened keep their state when you navigate back, instead of flashing a loading skeleton again.",
          es: "Las páginas que ya abriste conservan su estado al regresar, en vez de volver a mostrar un esqueleto de carga.",
        },
      },
      {
        type: "improved",
        text: {
          en: "The app icon now sits on its own dark backdrop, so it stays legible in browser tabs and search results.",
          es: "El ícono de la app ahora tiene su propio fondo oscuro, para que se lea bien en las pestañas del navegador y en los resultados de búsqueda.",
        },
      },
      {
        type: "fixed",
        text: {
          en: "Spanish pages are now submitted to search engines in their own right, not only as translations of the English ones.",
          es: "Las páginas en español ahora se envían a los buscadores por derecho propio, no solo como traducción de las inglesas.",
        },
      },
      {
        type: "fixed",
        text: {
          en: "The hero animation recovers instead of disappearing when the browser reclaims its graphics context, and is skipped entirely on devices without one.",
          es: "La animación principal se recupera en vez de desaparecer cuando el navegador libera su contexto gráfico, y se omite por completo en dispositivos que no lo tienen.",
        },
      },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-07-13",
    title: {
      en: "Mobile app & Premium (open beta)",
      es: "App móvil y Premium (beta abierta)",
    },
    changes: [
      {
        type: "added",
        text: {
          en: "The Metri mobile app is here in open beta — 16 calculators, guides and a full training tracker, all offline-first.",
          es: "La app móvil de Metri llega en beta abierta — 16 calculadoras, guías y un tracker de entrenamiento completo, todo offline-first.",
        },
      },
      {
        type: "added",
        text: {
          en: "One Metri account now works across web and mobile — sign in on your phone with the same email.",
          es: "Una sola cuenta Metri funciona en web y móvil — inicia sesión en tu teléfono con el mismo correo.",
        },
      },
      {
        type: "added",
        text: {
          en: "Premium (open beta): cloud sync & backup for your training across devices. The core app — calculators, guides and tracking — stays free forever.",
          es: "Premium (beta abierta): sync y respaldo en la nube de tu entrenamiento entre dispositivos. El núcleo —calculadoras, guías y seguimiento— es gratis para siempre.",
        },
      },
      {
        type: "added",
        text: {
          en: "Export your data anytime, in the app — your information is always yours to take with you.",
          es: "Exporta tu información cuando quieras, desde la app — tus datos siempre son tuyos para llevar.",
        },
      },
      {
        type: "improved",
        text: {
          en: "Your account page now shows your real plan (Free or Premium).",
          es: "Tu página de cuenta ahora muestra tu plan real (Gratis o Premium).",
        },
      },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-06-30",
    title: {
      en: "Secure accounts & hero refresh",
      es: "Cuentas seguras y nuevo hero",
    },
    changes: [
      {
        type: "added",
        text: {
          en: "Sign-ups now confirm your email and are shielded from bots, so your account stays yours and the community stays clean.",
          es: "El registro ahora confirma tu correo y está protegido contra bots, así tu cuenta es solo tuya y la comunidad se mantiene limpia.",
        },
      },
      {
        type: "added",
        text: {
          en: "After signing up, a one-tap “Open Gmail” button takes you straight to your confirmation email.",
          es: "Tras registrarte, un botón «Abrir Gmail» te lleva directo a tu correo de confirmación.",
        },
      },
      {
        type: "improved",
        text: {
          en: "Redesigned homepage hero with animated light beams.",
          es: "Hero de la página principal rediseñado con haces de luz animados.",
        },
      },
      {
        type: "improved",
        text: {
          en: "Calculators no longer jump while you type — the result and chart hold their place as you tweak values.",
          es: "Las calculadoras ya no saltan mientras escribes — el resultado y la gráfica se quedan en su lugar al ajustar valores.",
        },
      },
      {
        type: "improved",
        text: {
          en: "Sign-in and sign-up error messages are now clear and fully translated in English and Spanish.",
          es: "Los mensajes de error al iniciar sesión y registrarse ahora son claros y están traducidos en inglés y español.",
        },
      },
      {
        type: "fixed",
        text: {
          en: "Light-mode legibility on the homepage and a clearer footer placement across pages.",
          es: "Legibilidad en modo claro en la página principal y mejor ubicación del pie de página en todo el sitio.",
        },
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-06-30",
    title: { en: "Glossary, tags & polish", es: "Glosario, tags y pulido" },
    changes: [
      {
        type: "added",
        text: {
          en: "Expanded glossary — highlighted terms across the guides link straight to a plain-English definition.",
          es: "Glosario ampliado — los términos resaltados en las guías llevan directo a una definición clara.",
        },
      },
      {
        type: "added",
        text: {
          en: "Topic tags on calculators and guides — tap a tag to find everything related.",
          es: "Tags de tema en calculadoras y guías — toca un tag para encontrar todo lo relacionado.",
        },
      },
      {
        type: "added",
        text: {
          en: "The search launcher now floats with a neon ring and can be tucked away; it lists guides too.",
          es: "El buscador ahora flota con un anillo neón y se puede ocultar; también lista las guías.",
        },
      },
      {
        type: "improved",
        text: {
          en: "Search ignores accents everywhere, so “imc” finds “IMC” and “proteina” finds “proteína”.",
          es: "La búsqueda ignora acentos en todos lados, así «imc» encuentra «IMC» y «proteina» encuentra «proteína».",
        },
      },
      {
        type: "improved",
        text: {
          en: "Cards now have a cursor-following spotlight and a cleaner, more responsive design.",
          es: "Las tarjetas ahora tienen un foco que sigue al cursor y un diseño más limpio y responsive.",
        },
      },
      {
        type: "added",
        text: {
          en: "The About page now shows what you can do with Metri.",
          es: "La página Acerca ahora muestra qué puedes hacer con Metri.",
        },
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-06-30",
    title: { en: "Redesign & accounts", es: "Rediseño y cuentas" },
    changes: [
      {
        type: "added",
        text: {
          en: "Command palette (⌘K) to jump to any calculator, guide or page.",
          es: "Paleta de comandos (⌘K) para saltar a cualquier calculadora, guía o página.",
        },
      },
      {
        type: "added",
        text: {
          en: "Account page with your plan, and a separate Activity page for history & favorites.",
          es: "Página de cuenta con tu plan, y una página de Actividad aparte para historial y favoritos.",
        },
      },
      {
        type: "added",
        text: {
          en: "Your profile now prefills calculators automatically.",
          es: "Tu perfil ahora rellena las calculadoras automáticamente.",
        },
      },
      {
        type: "improved",
        text: {
          en: "New Geist typography and a sharper, deeper visual identity.",
          es: "Nueva tipografía Geist y una identidad visual más marcada y profunda.",
        },
      },
      {
        type: "improved",
        text: {
          en: "Calculator results redesigned with a wider, live chart layout.",
          es: "Resultados de calculadora rediseñados con una disposición ancha y gráficas en vivo.",
        },
      },
      {
        type: "added",
        text: {
          en: "Cookie consent and privacy controls.",
          es: "Consentimiento de cookies y controles de privacidad.",
        },
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-06-15",
    title: { en: "First release", es: "Primer lanzamiento" },
    changes: [
      {
        type: "added",
        text: {
          en: "16 free fitness calculators with instant, shareable results.",
          es: "16 calculadoras de fitness gratis con resultados instantáneos y compartibles.",
        },
      },
      {
        type: "added",
        text: {
          en: "Evidence-based knowledge base in English and Spanish.",
          es: "Base de conocimientos basada en evidencia en inglés y español.",
        },
      },
      {
        type: "added",
        text: {
          en: "Optional free account: calculation history and favorites.",
          es: "Cuenta gratis opcional: historial de cálculos y favoritos.",
        },
      },
      {
        type: "added",
        text: {
          en: "Installable PWA with offline calculators.",
          es: "PWA instalable con calculadoras sin conexión.",
        },
      },
    ],
  },
];

/** Shipped mobile releases. The app is in open beta on Android (installed from
 * the APK on the download page), so versions are real even though it isn't on
 * Play Store yet. Newest first, same shape as the web changelog. */
export const MOBILE_CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.3.0",
    date: "2026-07-28",
    title: {
      en: "Open beta on Android",
      es: "Beta abierta en Android",
    },
    changes: [
      {
        type: "added",
        text: {
          en: "The app is downloadable as an APK. It needs a free account — no card, no payment — and the same one works on the web.",
          es: "La app ya se puede descargar como APK. Requiere una cuenta gratuita — sin tarjeta ni pagos — y la misma sirve en la web.",
        },
      },
      {
        type: "added",
        text: {
          en: "Full training tracker: programs, custom routines, rest timers, workout history and per-set logging.",
          es: "Tracker de entrenamiento completo: programas, rutinas personalizadas, timers de descanso, historial y registro serie por serie.",
        },
      },
      {
        type: "added",
        text: {
          en: "16 calculators and the knowledge base, all working with no connection.",
          es: "16 calculadoras y la base de conocimiento, todo funcionando sin conexión.",
        },
      },
      {
        type: "added",
        text: {
          en: "Progress photos, reminders and adherence tracking — all stored on your device.",
          es: "Fotos de progreso, recordatorios y seguimiento de adherencia — todo guardado en tu dispositivo.",
        },
      },
      {
        type: "added",
        text: {
          en: "Premium cloud sync: your training is backed up and mirrored across your devices, automatically. The ring around your avatar shows the status. Progress photos stay on the device.",
          es: "Sync en la nube con Premium: tu entrenamiento se respalda y se replica entre tus dispositivos, automáticamente. El anillo alrededor de tu avatar muestra el estado. Las fotos de progreso se quedan en el dispositivo.",
        },
      },
      {
        type: "improved",
        text: {
          en: "The app updates itself over the air — you only reinstall when a new APK is published.",
          es: "La app se actualiza por aire — solo reinstalas cuando se publica un APK nuevo.",
        },
      },
      {
        type: "fixed",
        text: {
          en: "Hardened how your data is stored: nothing is backed up to Google Drive, and old credential material left over from the offline-only version was removed from the device.",
          es: "Se endureció el almacenamiento de tus datos: nada se respalda en Google Drive, y se eliminaron del dispositivo credenciales antiguas que quedaban de la versión sin conexión.",
        },
      },
    ],
  },
];

/** What's next on mobile. */
export const MOBILE_ROADMAP: L[] = [
  {
    en: "iOS beta through TestFlight.",
    es: "Beta de iOS a través de TestFlight.",
  },
  {
    en: "Play Store listing, so updates arrive without sideloading.",
    es: "Publicación en Play Store, para que las actualizaciones lleguen sin instalación manual.",
  },
  {
    en: "Progress photos included in cloud backup.",
    es: "Fotos de progreso incluidas en el respaldo en la nube.",
  },
  {
    en: "Shared body metrics between the web and the app.",
    es: "Métricas corporales compartidas entre la web y la app.",
  },
];
