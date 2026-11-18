import { describe, expect, it } from "vitest";

import { getDocSlugs } from "@/lib/docs";
import type { Locale } from "@/lib/i18n/config";
import { CALC_IDS } from "@/lib/i18n/routes";

import { calcCard, docCard, type OgPage, pageCard } from "./cards";
import { clip } from "./render";

const LOCALES: Locale[] = ["en", "es"];
const PAGES: OgPage[] = [
  "home",
  "tools",
  "docs",
  "download",
  "contact",
  "quiz",
  "roadmap",
  "about",
  "privacy",
  "terms",
];

describe("Open Graph cards", () => {
  it.each(LOCALES)("every page has a titled card in %s", (locale) => {
    for (const page of PAGES) {
      const card = pageCard(page, locale);
      expect(card.title, page).not.toBe("");
      expect(card.eyebrow, page).not.toBe("");
    }
  });

  it.each(LOCALES)("every calculator shows its formula in %s", (locale) => {
    for (const id of CALC_IDS) {
      const card = calcCard(id, locale);
      expect(card.title, id).not.toBe("");
      expect(card.eyebrow, id).toContain(" · ");
    }
  });

  it.each(LOCALES)("every guide has a card in %s", (locale) => {
    for (const slug of getDocSlugs(locale)) {
      const card = docCard(slug, locale);
      expect(card?.title, slug).toBeTruthy();
      expect(card?.url, slug).toMatch(new RegExp(`/docs/${slug}$`));
    }
    expect(docCard("no-such-guide", locale)).toBeNull();
  });

  it("lists a guide's sections, not its sub-sections", () => {
    const items = docCard("tdee", "en")?.panel?.items ?? [];
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(4);
    expect(items.every((i) => !/[*`[\]]/.test(i.label))).toBe(true);
  });
});

describe("clip", () => {
  it("keeps short text and cuts long text at a word", () => {
    expect(clip("Short", 10)).toBe("Short");
    expect(clip("Find your maintenance calories today", 20)).toBe("Find your…");
  });
});
