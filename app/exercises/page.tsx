import type { Metadata } from "next";

import { ExercisesIndex } from "@/components/exercises/ExercisesIndex";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Exercise Library",
  description:
    "Free exercise library with form guides — target muscles, equipment and step-by-step technique for the lifts that matter.",
  alternates: metaAlternates("exercises", "en"),
};

const ExercisesPage = () => <ExercisesIndex locale="en" />;

export default ExercisesPage;
