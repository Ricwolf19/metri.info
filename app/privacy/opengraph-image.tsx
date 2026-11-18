import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Privacy policy";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("privacy", "en"));

export default Image;
