import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Acerca de Metri";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("about", "es"));

export default Image;
