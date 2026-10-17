import type { Metadata } from "next";

import { type QuizSearchParams, QuizView } from "@/components/quiz/QuizView";
import { translate } from "@/lib/i18n/config";
import { decodeScores } from "@/lib/quiz/scores";
import { sectionMetadata } from "@/lib/seo/pages";
import { absoluteUrl } from "@/lib/utils";

const LOCALE = "en";

/** The page card, or the sender's knowledge map when the link carries `?r=`.
 * Reading `searchParams` defers metadata to request time; the session half of
 * the page already does, so the shell still prerenders. */
export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: QuizSearchParams;
}): Promise<Metadata> => {
  const base = sectionMetadata("quiz", LOCALE);
  const { r } = await searchParams;
  const shared = typeof r === "string" && decodeScores(r) ? r : null;
  const image = {
    url: absoluteUrl(
      `/og/quiz?locale=${LOCALE}${shared ? `&r=${shared}` : ""}`,
    ),
    width: 1200,
    height: 630,
  };
  if (!shared)
    return {
      ...base,
      openGraph: { ...base.openGraph, images: [image] },
      twitter: { ...base.twitter, images: [image.url] },
    };
  const title = translate(LOCALE, "quiz.sharedTitle");
  const description = translate(LOCALE, "quiz.sharedBody");
  return {
    ...base,
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: { ...base.openGraph, title, description, images: [image] },
    twitter: { ...base.twitter, title, description, images: [image.url] },
  };
};

const QuizPage = ({ searchParams }: { searchParams: QuizSearchParams }) => (
  <QuizView locale={LOCALE} searchParams={searchParams} />
);

export default QuizPage;
