import type { Metadata } from "next";

import { AboutFeatures } from "@/components/marketing/AboutFeatures";
import { LegalView } from "@/components/legal/LegalView";
import { metaAlternates } from "@/lib/i18n/routes";
import { LEGAL_CONTENT } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: LEGAL_CONTENT.about.es.title,
  description: LEGAL_CONTENT.about.es.lead,
  alternates: metaAlternates("about", "es"),
};

const AcercaPage = () => (
  <>
    <LegalView locale="es" doc="about" />
    <AboutFeatures />
  </>
);

export default AcercaPage;
