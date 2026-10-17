import type { Metadata } from "next";

import { type Locale, translate } from "@/lib/i18n/config";
import { metaAlternates, ROUTES } from "@/lib/i18n/routes";
import { absoluteUrl } from "@/lib/utils";

/** Section pages with their own Open Graph card. */
export type SectionId = "tools" | "docs" | "download" | "contact" | "quiz";

type SectionCopy = { title: string; description: string; eyebrow: string };

const COPY: Record<
  Exclude<SectionId, "contact" | "quiz">,
  Record<Locale, SectionCopy>
> = {
  tools: {
    en: {
      title: "Free Fitness Calculators",
      description:
        "Free fitness calculators: 1RM, TDEE, macros, body fat, BMI, FFMI, hydration and barbell plates. The same formulas as the Metri app, instantly in your browser.",
      eyebrow: "Calculators",
    },
    es: {
      title: "Calculadoras de fitness gratis",
      description:
        "Calculadoras de fitness gratis: 1RM, TDEE, macros, grasa corporal, IMC, FFMI, hidratación y discos de barra. Las mismas fórmulas que la app Metri, al instante.",
      eyebrow: "Calculadoras",
    },
  },
  docs: {
    en: {
      title: "Knowledge Base",
      description:
        "Evidence-based guides on nutrition, training and recovery, written for lifters, not clickbait.",
      eyebrow: "Docs",
    },
    es: {
      title: "Base de conocimiento",
      description:
        "Guías basadas en evidencia sobre nutrición, entrenamiento y recuperación, escritas para lifters, no clickbait.",
      eyebrow: "Docs",
    },
  },
  download: {
    en: {
      title: "Download the Metri app",
      description:
        "Download the Metri beta for Android: a free, open-source, offline-first workout tracker. Direct APK with version, release notes and SHA-256 checksum; iOS coming soon.",
      eyebrow: "Android · open source",
    },
    es: {
      title: "Descarga la app de Metri",
      description:
        "Descarga la beta de Metri para Android: un registro de entrenamientos gratis, de código abierto y sin conexión primero. APK directo con versión, notas y checksum SHA-256; iOS próximamente.",
      eyebrow: "Android · código abierto",
    },
  },
};

/** Title, description and card eyebrow of a section page, per locale. */
export const sectionCopy = (id: SectionId, locale: Locale): SectionCopy => {
  if (id === "contact")
    return {
      title: translate(locale, "contact.title"),
      description: translate(locale, "contact.subtitle"),
      eyebrow: translate(locale, "nav.contact"),
    };
  if (id === "quiz")
    return {
      title: translate(locale, "quiz.title"),
      description: translate(locale, "quiz.seoDescription"),
      eyebrow: translate(locale, "quiz.eyebrow"),
    };
  return COPY[id][locale];
};

/**
 * Metadata of a section page: title, description, alternates and the social
 * tags, so a shared link carries the page's own words instead of the root
 * layout's. The card image comes from the segment's `opengraph-image.tsx`
 * (or `openGraph.images` where the card is dynamic, as on the quiz).
 */
export const sectionMetadata = (id: SectionId, locale: Locale): Metadata => {
  const { title, description } = sectionCopy(id, locale);
  return {
    title,
    description,
    alternates: metaAlternates(id, locale),
    openGraph: {
      type: "website",
      siteName: "Metri",
      url: absoluteUrl(ROUTES[id][locale]),
      title: `${title} · Metri`,
      description,
      locale: locale === "es" ? "es_MX" : "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
  };
};
