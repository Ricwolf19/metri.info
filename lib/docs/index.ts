import "server-only";

import fs from "node:fs";
import path from "node:path";

import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import readingTime from "reading-time";

import type { Locale } from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n/en";

const DOCS_DIR = path.join(process.cwd(), "content/docs");

/** Categories in sidebar order, with their i18n label keys. */
export const DOC_CATEGORIES = [
  "getting-started",
  "calculators",
  "nutrition",
  "training",
  "recovery",
  "supplements",
  "progress",
  "glossary",
] as const;

export type DocCategory = (typeof DOC_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<DocCategory, TranslationKey> = {
  "getting-started": "docs.category.gettingStarted",
  calculators: "docs.category.calculators",
  nutrition: "docs.category.nutrition",
  training: "docs.category.training",
  recovery: "docs.category.recovery",
  supplements: "docs.category.supplements",
  progress: "docs.category.progress",
  glossary: "docs.category.glossary",
};

type DocFrontmatter = {
  title: string;
  description: string;
  category: DocCategory;
  tags?: string[];
  order?: number;
};

export type DocMeta = DocFrontmatter & {
  slug: string;
  readingMinutes: number;
};

export type TocItem = { depth: 2 | 3; text: string; id: string };

const localeDir = (locale: Locale) => path.join(DOCS_DIR, locale);

export const getDocSlugs = (locale: Locale): string[] => {
  const dir = localeDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
};

export const getDoc = (
  locale: Locale,
  slug: string,
): { meta: DocMeta; content: string } | null => {
  const file = path.join(localeDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const fm = data as DocFrontmatter;
  return {
    meta: {
      slug,
      ...fm,
      readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    },
    content,
  };
};

/** All docs for a locale, sorted by category order then frontmatter `order`. */
export const getAllDocs = (locale: Locale): DocMeta[] => {
  const docs = getDocSlugs(locale)
    .map((slug) => getDoc(locale, slug)?.meta)
    .filter((d): d is DocMeta => Boolean(d));
  return docs.sort((a, b) => {
    const cat =
      DOC_CATEGORIES.indexOf(a.category) - DOC_CATEGORIES.indexOf(b.category);
    return cat !== 0 ? cat : (a.order ?? 99) - (b.order ?? 99);
  });
};

/** Build a table of contents from h2/h3 headings (ids match rehype-slug). */
export const getToc = (content: string): TocItem[] => {
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  let inFence = false;
  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (m) {
      toc.push({
        depth: m[1].length as 2 | 3,
        text: m[2].trim(),
        id: slugger.slug(m[2].trim()),
      });
    }
  }
  return toc;
};

/** Previous / next doc within the sorted list (for footer nav). */
export const getDocSiblings = (locale: Locale, slug: string) => {
  const all = getAllDocs(locale);
  const i = all.findIndex((d) => d.slug === slug);
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
};
