import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "About Metri";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("about", "en"));

export default Image;
