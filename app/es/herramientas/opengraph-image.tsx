import { sectionCopy } from "@/lib/seo/pages";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Metri · Free fitness calculators";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => {
  const { title, description, eyebrow } = sectionCopy("tools", "es");
  return renderOg(title, eyebrow, description);
};

export default Image;
