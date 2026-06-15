import { CALC_CONTENT } from "@/lib/calculators/content";
import { calcIdForSlug } from "@/lib/i18n/routes";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Calculadora METRI";
export const size = ogSize;
export const contentType = ogContentType;

const Image = async ({ params }: { params: Promise<{ calc: string }> }) => {
  const { calc } = await params;
  const id = calcIdForSlug("es", calc);
  const c = id ? CALC_CONTENT[id].es : null;
  return renderOg(
    c?.h1 ?? "Calculadora de fitness",
    "Calculadora gratis",
    c?.tagline ?? "",
  );
};

export default Image;
