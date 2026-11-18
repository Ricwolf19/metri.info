import { pageCard } from "@/lib/og/cards";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og/render";

export const alt = "Metri · Download the app";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => renderOgCard(pageCard("download", "en"));

export default Image;
