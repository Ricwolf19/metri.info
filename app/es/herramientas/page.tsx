import type { Metadata } from "next";

import { ToolsIndex } from "@/components/calculators/ToolsIndex";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Calculadoras de fitness gratis",
  description:
    "Calculadoras de fitness gratis — 1RM, TDEE, macros, grasa corporal, IMC, FFMI, hidratación y discos de barra. Las mismas fórmulas que la app METRI, al instante.",
  alternates: metaAlternates("tools", "es"),
};

const HerramientasPage = () => <ToolsIndex locale="es" />;

export default HerramientasPage;
