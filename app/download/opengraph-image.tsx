import { sectionCopy } from "@/lib/seo/pages";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Metri · Download the app";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () => {
  const { title, description, eyebrow } = sectionCopy("download", "en");
  return renderOg(title, eyebrow, description);
};

export default Image;
