import type { Metadata } from "next";

import { ToolsIndex } from "@/components/calculators/ToolsIndex";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Free Fitness Calculators",
  description:
    "Free fitness calculators — 1RM, TDEE, macros, body fat, BMI, FFMI, hydration and barbell plates. The same formulas as the METRI app, instantly in your browser.",
  alternates: metaAlternates("tools", "en"),
};

const ToolsPage = () => <ToolsIndex locale="en" />;

export default ToolsPage;
