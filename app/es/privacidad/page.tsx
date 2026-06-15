import type { Metadata } from "next";

import { LegalView } from "@/components/legal/LegalView";
import { metaAlternates } from "@/lib/i18n/routes";
import { LEGAL_CONTENT } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: LEGAL_CONTENT.privacy.es.title,
  description: LEGAL_CONTENT.privacy.es.lead,
  alternates: metaAlternates("privacy", "es"),
};

const PrivacidadPage = () => <LegalView locale="es" doc="privacy" />;

export default PrivacidadPage;
