import type { Metadata } from "next";

import { TrackView } from "@/components/analytics/TrackView";
import { DocArticle } from "@/components/docs/DocArticle";
import { getDoc, getDocSlugs } from "@/lib/docs";

export const generateStaticParams = () =>
  getDocSlugs("en").map((slug) => ({ slug }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const doc = getDoc("en", slug);
  if (!doc) return {};
  return {
    title: doc.meta.title,
    description: doc.meta.description,
    alternates: {
      canonical: `/docs/${slug}`,
      languages: {
        en: `/docs/${slug}`,
        es: `/es/docs/${slug}`,
        "x-default": `/docs/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: doc.meta.title,
      description: doc.meta.description,
    },
  };
};

const DocPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return (
    <>
      <TrackView event="docs_viewed" properties={{ slug, locale: "en" }} />
      <DocArticle locale="en" slug={slug} />
    </>
  );
};

export default DocPage;
