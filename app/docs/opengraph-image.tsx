import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Knowledge base";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("docs", "en"));

export default Image;
