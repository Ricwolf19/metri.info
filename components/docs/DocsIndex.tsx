import { DocsBrowser } from "@/components/docs/DocsBrowser";
import { Container } from "@/components/shared/Container";
import { getT } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { CATEGORY_LABEL, DOC_CATEGORIES, getAllDocs } from "@/lib/docs";

/** Docs landing — header + searchable, category-grouped card grid. */
export const DocsIndex = async ({ locale }: { locale: Locale }) => {
  const t = await getT();
  const docs = getAllDocs(locale);
  const categories = DOC_CATEGORIES.map((category) => ({
    category,
    labelKey: CATEGORY_LABEL[category],
  }));

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink-50 sm:text-5xl">
          {t("docs.title")}
        </h1>
        <p className="mt-4 text-lg text-ink-300">{t("docs.subtitle")}</p>
      </div>

      <DocsBrowser
        docs={docs}
        categories={categories}
        basePath={routePath("docs", locale)}
      />
    </Container>
  );
};
