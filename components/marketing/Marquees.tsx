import { Marquee } from "@/components/marketing/Marquee";
import { CALC_CONTENT } from "@/lib/calculators/content";
import { getDocsIndex } from "@/lib/docs";
import type { Locale } from "@/lib/i18n/config";
import { CALC_IDS, routePath } from "@/lib/i18n/routes";

/** Two strips under the hero: the seventeen calculators gliding left, the
 * knowledge base gliding right. Every chip is a real internal link, so this is
 * also the crawl path into both halves of the site. */
export const Marquees = async ({ locale }: { locale: Locale }) => {
  const docs = (await getDocsIndex())[locale];
  const docsBase = routePath("docs", locale);
  const calcs = CALC_IDS.map((id) => ({
    href: routePath(id, locale),
    label: CALC_CONTENT[id][locale].h1,
    calcId: id,
  }));
  const guides = docs.map((d) => ({
    href: `${docsBase}/${d.slug}`,
    label: d.title,
  }));

  return (
    <div className="border-y border-ink-600/40 bg-ink-900 py-2">
      <Marquee items={calcs} labelKey="nav.tools" />
      <Marquee
        items={guides}
        labelKey="nav.docs"
        direction="right"
        speed={28}
      />
    </div>
  );
};
