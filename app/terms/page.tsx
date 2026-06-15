import type { Metadata } from "next";

import { LegalView } from "@/components/legal/LegalView";
import { metaAlternates } from "@/lib/i18n/routes";
import { LEGAL_CONTENT } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: LEGAL_CONTENT.terms.en.title,
  description: LEGAL_CONTENT.terms.en.lead,
  alternates: metaAlternates("terms", "en"),
};

const TermsPage = () => <LegalView locale="en" doc="terms" />;

export default TermsPage;
