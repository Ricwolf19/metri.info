import {
  ToolsBrowser,
  type ToolCard,
} from "@/components/calculators/ToolsBrowser";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/Section";
import { createT, type Locale } from "@/lib/i18n/config";
import { CALC_IDS, routePath } from "@/lib/i18n/routes";
import { CALC_CONTENT } from "@/lib/calculators/content";
import { isPopularCalc } from "@/lib/calculators/registry";
import { CALC_TAGS } from "@/lib/calculators/tags";

export const ToolsIndex = ({ locale }: { locale: Locale }) => {
  const t = createT(locale);

  const cards: ToolCard[] = CALC_IDS.map((id) => {
    const c = CALC_CONTENT[id][locale];
    return {
      id,
      href: routePath(id, locale),
      title: c.h1,
      tagline: c.tagline,
      keywords: c.seoTitle,
      popular: isPopularCalc(id),
      tags: CALC_TAGS[id][locale],
    };
  });

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow={t("nav.tools")}
        title={t("tools.title")}
        subtitle={t("tools.subtitle")}
        className="mb-10"
      />
      <ToolsBrowser cards={cards} />
    </Container>
  );
};
