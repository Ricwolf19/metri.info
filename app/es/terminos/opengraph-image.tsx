import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Términos del servicio";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("terms", "es"));

export default Image;
