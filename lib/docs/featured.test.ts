import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { FEATURED_DOCS, featuredDocTitles } from "./featured";

const slugs = FEATURED_DOCS.flatMap((group) => group.docs.map((d) => d.slug));

describe("FEATURED_DOCS", () => {
  it.each(["en", "es"])("every guide exists in %s", (locale) => {
    for (const slug of slugs)
      expect(
        existsSync(join(process.cwd(), "content/docs", locale, `${slug}.mdx`)),
        `${locale}/${slug}`,
      ).toBe(true);
  });

  it("lists each guide once", () => {
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("featuredDocTitles", () => {
  it("keeps only the featured guides' titles", () => {
    const index = {
      en: [
        { slug: "tdee", title: "BMR & TDEE explained" },
        { slug: "welcome", title: "What is Metri?" },
      ],
      es: [{ slug: "tdee", title: "BMR y TDEE explicados" }],
    };
    expect(featuredDocTitles(index)).toEqual({
      en: { tdee: "BMR & TDEE explained" },
      es: { tdee: "BMR y TDEE explicados" },
    });
  });
});
