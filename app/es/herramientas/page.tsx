import type { Metadata } from "next";

import { ComingSoon } from "@/components/shared/ComingSoon";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Calculadoras y herramientas",
  alternates: metaAlternates("tools", "es"),
  robots: { index: false },
};

const HerramientasPage = () => <ComingSoon titleKey="nav.tools" />;

export default HerramientasPage;
