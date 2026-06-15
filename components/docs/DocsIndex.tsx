import { DocsBrowser } from "@/components/docs/DocsBrowser";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/Section";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { CATEGORY_LABEL, DOC_CATEGORIES, getAllDocs } from "@/lib/docs";

/** Docs landing — header + searchable, category-grouped card grid. */
export const DocsIndex = ({ locale }: { locale: Locale }) => {
  const t = createT(locale);
  const docs = getAllDocs(locale);
  const categories = DOC_CATEGORIES.map((category) => ({
    category,
    labelKey: CATEGORY_LABEL[category],
  }));

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow={t("nav.docs")}
        title={t("docs.title")}
        subtitle={t("docs.subtitle")}
        className="mb-12"
      />

      <DocsBrowser
        docs={docs}
        categories={categories}
        basePath={routePath("docs", locale)}
      />
    </Container>
  );
};
