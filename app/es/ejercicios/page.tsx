import type { Metadata } from "next";

import { ExercisesIndex } from "@/components/exercises/ExercisesIndex";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Biblioteca de ejercicios",
  description:
    "Biblioteca de ejercicios gratis con guías de técnica — músculos implicados, equipo y técnica paso a paso para los ejercicios que importan.",
  alternates: metaAlternates("exercises", "es"),
};

const EjerciciosPage = () => <ExercisesIndex locale="es" />;

export default EjerciciosPage;
