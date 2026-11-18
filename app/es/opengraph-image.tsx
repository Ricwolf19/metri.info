import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Registro de fitness de código abierto";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("home", "es"));

export default Image;
