import type { Metadata } from "next";

import { ComingSoon } from "@/components/shared/ComingSoon";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Calculators & Tools",
  alternates: metaAlternates("tools", "en"),
  robots: { index: false },
};

const ToolsPage = () => <ComingSoon titleKey="nav.tools" />;

export default ToolsPage;
