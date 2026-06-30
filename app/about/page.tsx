import type { Metadata } from "next";

import { AboutFeatures } from "@/components/marketing/AboutFeatures";
import { LegalView } from "@/components/legal/LegalView";
import { metaAlternates } from "@/lib/i18n/routes";
import { LEGAL_CONTENT } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: LEGAL_CONTENT.about.en.title,
  description: LEGAL_CONTENT.about.en.lead,
  alternates: metaAlternates("about", "en"),
};

const AboutPage = () => (
  <>
    <LegalView locale="en" doc="about" />
    <AboutFeatures />
  </>
);

export default AboutPage;
