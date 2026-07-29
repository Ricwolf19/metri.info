import type { MetadataRoute } from "next";

import { CALC_IDS, ROUTES, type RouteId } from "@/lib/i18n/routes";
import { getDoc, getDocSlugs } from "@/lib/docs";
import { DOC_LAST_REVIEWED } from "@/lib/docs/sources";
import { absoluteUrl } from "@/lib/utils";

type Entry = MetadataRoute.Sitemap[number];

/** One `<url>` block per language version, each carrying the full reciprocal
 * alternate set — Google's hreflang spec expects every version to be submitted
 * on its own, not just referenced as an alternate of the English one. */
const entry = (
  enPath: string,
  esPath: string,
  priority: number,
  changeFrequency: Entry["changeFrequency"],
  lastModified: Date,
): Entry[] => {
  const languages = {
    en: absoluteUrl(enPath),
    es: absoluteUrl(esPath),
    "x-default": absoluteUrl(enPath),
  };
  return [enPath, esPath].map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
};

const sitemap = (): MetadataRoute.Sitemap => {
  const now = new Date();

  const sections: RouteId[] = [
    "home",
    "tools",
    "docs",
    "download",
    "changelog",
  ];
  const staticEntries = sections.flatMap((id) =>
    entry(ROUTES[id].en, ROUTES[id].es, id === "home" ? 1 : 0.7, "weekly", now),
  );

  const legal: RouteId[] = ["about", "contact", "privacy", "terms"];
  const legalEntries = legal.flatMap((id) =>
    entry(ROUTES[id].en, ROUTES[id].es, 0.3, "yearly", now),
  );

  const calcEntries = CALC_IDS.flatMap((id) =>
    entry(ROUTES[id].en, ROUTES[id].es, 0.9, "monthly", now),
  );

  // Docs carry a real `<lastmod>`: the article's own `updatedAt` frontmatter when
  // set, else the last knowledge-base review. Static/tool pages keep `now` (the
  // build/deploy time — they change together on deploy, so it's honest).
  const docEntries = getDocSlugs("en").flatMap((slug) => {
    const updatedAt = getDoc("en", slug)?.meta.updatedAt;
    return entry(
      `/docs/${slug}`,
      `/es/docs/${slug}`,
      0.6,
      "monthly",
      new Date(updatedAt ?? DOC_LAST_REVIEWED),
    );
  });

  return [...staticEntries, ...calcEntries, ...docEntries, ...legalEntries];
};

export default sitemap;
