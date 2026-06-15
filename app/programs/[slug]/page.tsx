import type { Metadata } from "next";

import { ProgramDetail } from "@/components/programs/ProgramDetail";
import { getProgram, getProgramSlugs } from "@/lib/programs/data";

export const generateStaticParams = () =>
  getProgramSlugs().map((slug) => ({ slug }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const p = getProgram(slug);
  if (!p) return {};
  return {
    title: p.name.en,
    description: p.description.en,
    alternates: {
      canonical: `/programs/${slug}`,
      languages: {
        en: `/programs/${slug}`,
        es: `/es/programas/${slug}`,
        "x-default": `/programs/${slug}`,
      },
    },
  };
};

const ProgramPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return <ProgramDetail locale="en" slug={slug} />;
};

export default ProgramPage;
