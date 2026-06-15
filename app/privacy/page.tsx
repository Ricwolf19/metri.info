import type { Metadata } from "next";

import { LegalView } from "@/components/legal/LegalView";
import { metaAlternates } from "@/lib/i18n/routes";
import { LEGAL_CONTENT } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: LEGAL_CONTENT.privacy.en.title,
  description: LEGAL_CONTENT.privacy.en.lead,
  alternates: metaAlternates("privacy", "en"),
};

const PrivacyPage = () => <LegalView locale="en" doc="privacy" />;

export default PrivacyPage;
