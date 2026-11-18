import { CALC_IDS, calcIdForSlug, ROUTES } from "@/lib/i18n/routes";
import { calcCard, pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Calculadora gratis";
export const size = ogSize;
export const contentType = ogContentType;

/** Every card is drawn at build, like the pages. */
export const generateStaticParams = () =>
  CALC_IDS.map((id) => ({ calc: ROUTES[id].es.split("/").pop() as string }));

const Image = async ({ params }: { params: Promise<{ calc: string }> }) => {
  const { calc } = await params;
  const id = calcIdForSlug("es", calc);
  return renderOgCard(id ? calcCard(id, "es") : pageCard("tools", "es"));
};

export default Image;
