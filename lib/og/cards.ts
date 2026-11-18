import "server-only";

import { CALC_CONTENT } from "@/lib/calculators/content";
import { CALC_GROUPS } from "@/lib/calculators/groups";
import {
  CATEGORY_LABEL,
  DOC_CATEGORIES,
  getAllDocs,
  getDoc,
  getToc,
} from "@/lib/docs";
import { createT, type Locale } from "@/lib/i18n/config";
import { type CalcRouteId, CALC_IDS, routePath } from "@/lib/i18n/routes";
import { LEGAL_CONTENT } from "@/lib/legal/content";
import { AREA_KEY, QUIZ_AREAS } from "@/lib/quiz/areas";
import { STAGES } from "@/lib/roadmap/steps";
import { sectionCopy } from "@/lib/seo/pages";

import { type OgCard, ogUrl } from "./render";

/**
 * What each page's Open Graph card says, in the page's language. Pages with
 * something to show beyond their title get a panel: a guide its sections, a
 * calculator its formula, an index what it holds. The segment's
 * `opengraph-image.tsx` passes the result to `renderOgCard`.
 */

export type OgPage =
  | "home"
  | "tools"
  | "docs"
  | "download"
  | "contact"
  | "quiz"
  | "roadmap"
  | "about"
  | "privacy"
  | "terms";

const base = (page: OgPage, locale: Locale) => ({
  url: ogUrl(routePath(page, locale)),
  note: createT(locale)("og.note"),
});

/** A section or static page. */
export const pageCard = (page: OgPage, locale: Locale): OgCard => {
  const t = createT(locale);
  switch (page) {
    case "home":
      return {
        ...base(page, locale),
        eyebrow: t("og.homeEyebrow"),
        title: t("hero.title"),
        description: t("hero.subtitle"),
        panel: {
          items: [
            { value: String(CALC_IDS.length), label: t("stats.calculators") },
            {
              value: String(getAllDocs(locale).length),
              label: t("stats.guides"),
            },
            { value: "0", label: t("stats.account") },
          ],
        },
      };
    case "tools":
      return {
        ...base(page, locale),
        ...sectionCopy("tools", locale),
        chips: [t("og.calcCount", { n: CALC_IDS.length })],
        panel: {
          items: CALC_GROUPS.map((group) => ({
            value: String(group.calcs.length),
            label: t(group.key),
          })),
        },
      };
    case "docs": {
      const docs = getAllDocs(locale);
      return {
        ...base(page, locale),
        ...sectionCopy("docs", locale),
        chips: [t("og.guideCount", { n: docs.length })],
        panel: {
          title: t("og.topics"),
          items: DOC_CATEGORIES.map((category) => ({
            value: String(docs.filter((d) => d.category === category).length),
            label: t(CATEGORY_LABEL[category]),
          })).filter((item) => Number(item.value) > 1),
        },
      };
    }
    case "quiz":
      return {
        ...base(page, locale),
        ...sectionCopy("quiz", locale),
        panel: {
          title: t("og.areas"),
          items: QUIZ_AREAS.map((area) => ({ label: t(AREA_KEY[area]) })),
        },
      };
    case "roadmap":
      return {
        ...base(page, locale),
        ...sectionCopy("roadmap", locale),
        panel: {
          title: t("og.stages"),
          items: STAGES.map((stage, i) => ({
            value: String(i + 1),
            label: t(`roadmap.stage.${stage}`),
          })),
        },
      };
    case "download":
    case "contact":
      return { ...base(page, locale), ...sectionCopy(page, locale) };
    case "about":
    case "privacy":
    case "terms": {
      const { title, lead } = LEGAL_CONTENT[page][locale];
      return {
        ...base(page, locale),
        eyebrow: t(`footer.${page}`),
        title,
        description: lead,
      };
    }
  }
};

/** A calculator: its name and tagline, its group, and the formula. */
export const calcCard = (id: CalcRouteId, locale: Locale): OgCard => {
  const t = createT(locale);
  const content = CALC_CONTENT[id][locale];
  const group = CALC_GROUPS.find((g) => g.calcs.includes(id));
  const formula = content.formula
    ?.split("\n")
    .filter(Boolean)
    .slice(0, 4)
    .map((line) => ({ label: line }));
  return {
    url: ogUrl(routePath(id, locale)),
    note: t("og.note"),
    eyebrow: group ? `${t("nav.tools")} · ${t(group.key)}` : t("nav.tools"),
    title: content.h1,
    description: content.tagline,
    panel: formula?.length
      ? { title: t("calc.formula"), items: formula, code: true }
      : undefined,
  };
};

/** Markdown out of a heading: links, emphasis and code marks. */
const plain = (text: string) =>
  text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();

/** A guide: its title and summary, its topic and reading time, and the
 * first sections it covers. Null for a slug with no guide in that language. */
export const docCard = (slug: string, locale: Locale): OgCard | null => {
  const doc = getDoc(locale, slug);
  if (!doc) return null;
  const t = createT(locale);
  const sections = getToc(doc.content)
    .filter((item) => item.depth === 2)
    .slice(0, 4)
    .map((item) => ({ label: plain(item.text) }));
  return {
    url: ogUrl(`${routePath("docs", locale)}/${slug}`),
    note: t("og.note"),
    eyebrow: `${t("nav.docs")} · ${t(CATEGORY_LABEL[doc.meta.category])}`,
    title: doc.meta.title,
    description: doc.meta.description,
    chips: [t("docs.readingTime", { minutes: doc.meta.readingMinutes })],
    panel: sections.length
      ? { title: t("docs.onThisPage"), items: sections }
      : undefined,
  };
};
