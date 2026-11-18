import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Open-source fitness tracker";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("home", "en"));

export default Image;
