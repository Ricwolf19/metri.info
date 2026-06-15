import type { Metadata } from "next";

import { ProgramsIndex } from "@/components/programs/ProgramsIndex";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Programas de entrenamiento",
  description:
    "Programas de entrenamiento estructurados y gratis — rutinas de powerbuilding y cuerpo completo con ejercicios, series y reps por día.",
  alternates: metaAlternates("programs", "es"),
};

const ProgramasPage = () => <ProgramsIndex locale="es" />;

export default ProgramasPage;
