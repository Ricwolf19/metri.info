import type { Metadata } from "next";

import { LegalView } from "@/components/legal/LegalView";
import { metaAlternates } from "@/lib/i18n/routes";
import { LEGAL_CONTENT } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: LEGAL_CONTENT.terms.es.title,
  description: LEGAL_CONTENT.terms.es.lead,
  alternates: metaAlternates("terms", "es"),
};

const TerminosPage = () => <LegalView locale="es" doc="terms" />;

export default TerminosPage;
