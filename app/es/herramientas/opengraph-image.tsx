import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Calculadoras de fitness gratis";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("tools", "es"));

export default Image;
