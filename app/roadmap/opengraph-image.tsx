import { sectionCopy } from "@/lib/seo/pages";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Metri · Roadmap";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => {
  const { title, description, eyebrow } = sectionCopy("roadmap", "en");
  return renderOg(title, eyebrow, description);
};

export default Image;
