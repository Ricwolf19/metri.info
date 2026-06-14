import type { Metadata } from "next";

import { ComingSoon } from "@/components/shared/ComingSoon";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Exercise Library",
  alternates: metaAlternates("exercises", "en"),
  robots: { index: false },
};

const ExercisesPage = () => <ComingSoon titleKey="nav.exercises" />;

export default ExercisesPage;
