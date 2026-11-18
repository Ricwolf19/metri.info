import { getDocSlugs } from "@/lib/docs";
import { docCard, pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Guía";
export const size = ogSize;
export const contentType = ogContentType;

/** Every card is drawn at build, like the pages. */
export const generateStaticParams = () =>
  getDocSlugs("es").map((slug) => ({ slug }));

const Image = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return renderOgCard(docCard(slug, "es") ?? pageCard("docs", "es"));
};

export default Image;
