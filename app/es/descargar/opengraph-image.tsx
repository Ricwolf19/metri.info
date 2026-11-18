import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Descarga la app";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("download", "es"));

export default Image;
