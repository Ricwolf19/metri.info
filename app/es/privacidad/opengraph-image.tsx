import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Política de privacidad";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("privacy", "es"));

export default Image;
