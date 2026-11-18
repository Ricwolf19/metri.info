import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Base de conocimiento";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("docs", "es"));

export default Image;
