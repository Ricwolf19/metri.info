import { Suspense } from "react";

import { DocsBrowser } from "@/components/docs/DocsBrowser";
import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
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
    <>
      <PageHero
        eyebrow={t("nav.docs")}
        title={t("docs.title")}
        subtitle={t("docs.subtitle")}
        compact
      />
      <Container className="py-12 sm:py-16">
        {/* Suspense isolates `useSearchParams` (tag deep-links) so the page
            stays statically prerendered. */}
        <Suspense>
          <DocsBrowser
            docs={docs}
            categories={categories}
            basePath={routePath("docs", locale)}
          />
        </Suspense>
      </Container>
    </>
  );
};
