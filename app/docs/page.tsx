import type { Metadata } from "next";

import { DocsIndex } from "@/components/docs/DocsIndex";
import { sectionMetadata } from "@/lib/seo/pages";

export const metadata: Metadata = sectionMetadata("docs", "en");

const DocsPage = () => <DocsIndex locale="en" />;

export default DocsPage;
