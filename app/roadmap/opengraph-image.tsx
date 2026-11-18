import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Fitness roadmap";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("roadmap", "en"));

export default Image;
