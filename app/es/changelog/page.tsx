import type { Metadata } from "next";

import { ChangelogView } from "@/components/changelog/ChangelogView";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Registro de cambios",
  description:
    "Lo nuevo en Metri — versiones y mejoras de la app web, además del roadmap de la app móvil.",
  alternates: metaAlternates("changelog", "es"),
};

const ChangelogPage = () => <ChangelogView />;

export default ChangelogPage;
