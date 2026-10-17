import { Suspense } from "react";

import {
  type QuizSearchParams,
  QuizSession,
} from "@/components/quiz/QuizSession";

export type { QuizSearchParams };
import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
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
      <Container className="py-10 sm:py-14">
        <Suspense fallback={<LoadingScreen />}>
          <QuizSession searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
};
