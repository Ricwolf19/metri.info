import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Ruta de fitness";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("roadmap", "es"));

export default Image;
