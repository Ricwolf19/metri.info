import type { Metadata } from "next";

import { ProgramsIndex } from "@/components/programs/ProgramsIndex";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Training Programs",
  description:
    "Free structured training programs — powerbuilding and full-body routines with per-day exercises, sets and reps.",
  alternates: metaAlternates("programs", "en"),
};

const ProgramsPage = () => <ProgramsIndex locale="en" />;

export default ProgramsPage;
