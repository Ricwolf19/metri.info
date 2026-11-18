import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Contact";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("contact", "en"));

export default Image;
