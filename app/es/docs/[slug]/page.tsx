import type { Metadata } from "next";

import { DocArticle } from "@/components/docs/DocArticle";
import { getDoc, getDocSlugs } from "@/lib/docs";

export const generateStaticParams = () =>
  getDocSlugs("es").map((slug) => ({ slug }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const doc = getDoc("es", slug);
  if (!doc) return {};
  return {
    title: doc.meta.title,
    description: doc.meta.description,
    alternates: {
      canonical: `/es/docs/${slug}`,
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

const DocPageEs = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return <DocArticle locale="es" slug={slug} />;
};

export default DocPageEs;
