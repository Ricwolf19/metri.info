import { Suspense } from "react";

import {
  type QuizSearchParams,
  QuizSession,
} from "@/components/quiz/QuizSession";

export type { QuizSearchParams };
import { PageHero } from "@/components/shared/PageHero";
import { Stage } from "@/components/shared/Stage";
import { QuizSkeleton } from "@/components/skeletons/QuizSkeleton";
import { createT, type Locale } from "@/lib/i18n/config";

/** The knowledge-check page, EN and ES: hero + the interactive flow. */
export const QuizView = ({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: QuizSearchParams;
}) => {
  const t = createT(locale);
  return (
    <>
      <PageHero
        eyebrow={t("quiz.eyebrow")}
        title={t("quiz.title")}
        subtitle={t("quiz.seoDescription")}
        compact
        share
      />
      <Stage className="py-10 sm:py-14">
        <Suspense fallback={<QuizSkeleton locale={locale} />}>
          <QuizSession searchParams={searchParams} />
        </Suspense>
      </Stage>
    </>
  );
};
