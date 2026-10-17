import { sectionCopy } from "@/lib/seo/pages";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Metri · Knowledge base";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => {
  const { title, description, eyebrow } = sectionCopy("docs", "es");
  return renderOg(title, eyebrow, description);
};

export default Image;
