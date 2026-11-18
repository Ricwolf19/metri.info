import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Terms of service";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("terms", "en"));

export default Image;
