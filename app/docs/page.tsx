import type { Metadata } from "next";

import { DocsIndex } from "@/components/docs/DocsIndex";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description:
    "Evidence-based guides on nutrition, training and recovery — written for lifters, not clickbait.",
  alternates: metaAlternates("docs", "en"),
};

const DocsPage = () => <DocsIndex locale="en" />;

export default DocsPage;
