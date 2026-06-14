import type { Metadata } from "next";

import { ComingSoon } from "@/components/shared/ComingSoon";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Programas de entrenamiento",
  alternates: metaAlternates("programs", "es"),
  robots: { index: false },
};

const ProgramasPage = () => <ComingSoon titleKey="nav.programs" />;

export default ProgramasPage;
