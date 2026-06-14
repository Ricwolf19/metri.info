import type { Metadata } from "next";

import { ComingSoon } from "@/components/shared/ComingSoon";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Biblioteca de ejercicios",
  alternates: metaAlternates("exercises", "es"),
  robots: { index: false },
};

const EjerciciosPage = () => <ComingSoon titleKey="nav.exercises" />;

export default EjerciciosPage;
