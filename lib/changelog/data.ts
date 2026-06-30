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

/** The mobile app is still in development — show the roadmap, not versions. */
export const MOBILE_ROADMAP: L[] = [
  {
    en: "Training programs with rest timers and custom routines.",
    es: "Programas de entrenamiento con timers de descanso y rutinas personalizadas.",
  },
  {
    en: "Progress tracking and historical data over time.",
    es: "Seguimiento de progreso y datos históricos en el tiempo.",
  },
  {
    en: "Cloud sync across web and mobile.",
    es: "Sincronización en la nube entre web y móvil.",
  },
  {
    en: "Reminders, macro logging and workout notes.",
    es: "Recordatorios, registro de macros y notas de entrenamiento.",
  },
];
