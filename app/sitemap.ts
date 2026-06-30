import type { MetadataRoute } from "next";

import { CALC_IDS, ROUTES, type RouteId } from "@/lib/i18n/routes";
import { getDocSlugs } from "@/lib/docs";
import { absoluteUrl } from "@/lib/utils";

type Entry = MetadataRoute.Sitemap[number];

const entry = (
  enPath: string,
  esPath: string,
  priority: number,
  changeFrequency: Entry["changeFrequency"],
  lastModified: Date,
): Entry => ({
  url: absoluteUrl(enPath),
  lastModified,
  changeFrequency,
  priority,
  alternates: {
    languages: { en: absoluteUrl(enPath), es: absoluteUrl(esPath) },
  },
});

const sitemap = (): MetadataRoute.Sitemap => {
  const now = new Date();

  const sections: RouteId[] = [
    "home",
    "tools",
    "docs",
    "download",
    "changelog",
  ];
  const staticEntries = sections.map((id) =>
    entry(ROUTES[id].en, ROUTES[id].es, id === "home" ? 1 : 0.7, "weekly", now),
  );

  const legal: RouteId[] = ["about", "contact", "privacy", "terms"];
  const legalEntries = legal.map((id) =>
    entry(ROUTES[id].en, ROUTES[id].es, 0.3, "yearly", now),
  );

  const calcEntries = CALC_IDS.map((id) =>
    entry(ROUTES[id].en, ROUTES[id].es, 0.9, "monthly", now),
  );

  const docEntries = getDocSlugs("en").map((slug) =>
    entry(`/docs/${slug}`, `/es/docs/${slug}`, 0.6, "monthly", now),
  );

  return [...staticEntries, ...calcEntries, ...docEntries, ...legalEntries];
};

export default sitemap;
