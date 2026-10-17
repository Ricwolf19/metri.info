import type { Metadata } from "next";

import { ToolsIndex } from "@/components/calculators/ToolsIndex";
import { sectionMetadata } from "@/lib/seo/pages";

export const metadata: Metadata = sectionMetadata("tools", "en");

const ToolsPage = () => <ToolsIndex locale="en" />;

export default ToolsPage;
