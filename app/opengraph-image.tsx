import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Metri · Open-source fitness tracker";
export const size = ogSize;
export const contentType = ogContentType;

const Image = () =>
  renderOg(
    "Track. Progress. Evolve.",
    "Open-source fitness tracker",
    "Free fitness calculators and an evidence-based knowledge base. No account, open source.",
  );

export default Image;
