import type { Metadata } from "next";

import { ComingSoon } from "@/components/shared/ComingSoon";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Training Programs",
  alternates: metaAlternates("programs", "en"),
  robots: { index: false },
};

const ProgramsPage = () => <ComingSoon titleKey="nav.programs" />;

export default ProgramsPage;
