import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Free fitness calculators";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("tools", "en"));

export default Image;
