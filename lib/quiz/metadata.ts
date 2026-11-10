import type { Metadata } from "next";

import { type Locale, translate } from "@/lib/i18n/config";
import { decodeScores } from "@/lib/quiz/scores";
import { sectionMetadata } from "@/lib/seo/pages";
import { absoluteUrl } from "@/lib/utils";

const card = (locale: Locale, code: string | null) => ({
  url: absoluteUrl(`/og/quiz?locale=${locale}${code ? `&r=${code}` : ""}`),
  width: 1200,
  height: 630,
});

/**
 * The knowledge check's metadata. Fixed on purpose: metadata that reads the
 * query is resolved per request, and Next streams it after the HTML to any
 * crawler that runs JavaScript, Googlebot included, so `/quiz` reached Google
 * with no title or canonical. Shared results live on their own URL instead.
 */
export const quizMetadata = (locale: Locale): Metadata => {
  const base = sectionMetadata("quiz", locale);
  const image = card(locale, null);
  return {
    ...base,
    openGraph: { ...base.openGraph, images: [image] },
    twitter: { ...base.twitter, images: [image.url] },
  };
};

/** A shared result (`?r=` on the result route): the sender's map as the
 * card, never indexed, canonical to the knowledge check itself. */
export const quizResultMetadata = async (
  locale: Locale,
  searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<Metadata> => {
  const base = quizMetadata(locale);
  const { r } = await searchParams;
  const code = typeof r === "string" && decodeScores(r) ? r : null;
  const robots = { index: false, follow: true };
  if (!code) return { ...base, robots };
  const title = translate(locale, "quiz.sharedTitle");
  const description = translate(locale, "quiz.sharedBody");
  const image = card(locale, code);
  return {
    ...base,
    title,
    description,
    robots,
    openGraph: { ...base.openGraph, title, description, images: [image] },
    twitter: { ...base.twitter, title, description, images: [image.url] },
  };
};
