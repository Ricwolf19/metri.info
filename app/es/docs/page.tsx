import type { Metadata } from "next";

import { DocsIndex } from "@/components/docs/DocsIndex";
import { sectionMetadata } from "@/lib/seo/pages";

export const metadata: Metadata = sectionMetadata("docs", "es");

const DocsPageEs = () => <DocsIndex locale="es" />;

export default DocsPageEs;
