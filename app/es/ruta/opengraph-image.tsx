import { sectionCopy } from "@/lib/seo/pages";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Metri · Ruta";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => {
  const { title, description, eyebrow } = sectionCopy("roadmap", "es");
  return renderOg(title, eyebrow, description);
};

export default Image;
