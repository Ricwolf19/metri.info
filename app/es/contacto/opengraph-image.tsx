import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Contacto";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("contact", "es"));

export default Image;
