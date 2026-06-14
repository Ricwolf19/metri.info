import type { Metadata } from "next";

import { DocsIndex } from "@/components/docs/DocsIndex";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Base de conocimiento",
  description:
    "Guías basadas en evidencia sobre nutrición, entrenamiento y recuperación — escritas para lifters, no clickbait.",
  alternates: metaAlternates("docs", "es"),
};

const DocsPageEs = () => <DocsIndex locale="es" />;

export default DocsPageEs;
