import { Suspense } from "react";

import { RoadmapSession } from "@/components/roadmap/RoadmapSession";
import { PageHero } from "@/components/shared/PageHero";
import { Stage } from "@/components/shared/Stage";
import { RoadmapSkeleton } from "@/components/skeletons/RoadmapSkeleton";
import { getAllDocs } from "@/lib/docs";
import { createT, type Locale } from "@/lib/i18n/config";
import { ROADMAP_DOCS } from "@/lib/roadmap/steps";

/** The roadmap page, EN and ES: hero + the client flow. The guide titles the
 * steps link are resolved here (the docs are read off disk on the server). */
export const RoadmapView = ({ locale }: { locale: Locale }) => {
  const t = createT(locale);
  const docTitles = Object.fromEntries(
    getAllDocs(locale)
      .filter((d) => ROADMAP_DOCS.includes(d.slug))
      .map((d) => [d.slug, d.title]),
  );
  return (
    <>
      <PageHero
        eyebrow={t("roadmap.eyebrow")}
        title={t("roadmap.title")}
        subtitle={t("roadmap.seoDescription")}
        compact
        share
      />
      <Stage className="py-10 sm:py-14">
        <Suspense fallback={<RoadmapSkeleton locale={locale} />}>
          <RoadmapSession docTitles={docTitles} />
        </Suspense>
      </Stage>
    </>
  );
};
