import type { Metadata } from "next";

import { Home } from "@/components/marketing/Home";
import { JsonLd } from "@/components/seo/JsonLd";
import { metaAlternates } from "@/lib/i18n/routes";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "METRI — Tracker de fitness de código abierto para lifters",
  description:
    "METRI es un compañero de entrenamiento de código abierto y sin conexión: calculadoras de fitness gratis (1RM, TDEE, macros, grasa corporal, FFMI), programas, biblioteca de ejercicios y una base de conocimiento basada en evidencia.",
  alternates: metaAlternates("home", "es"),
  openGraph: {
    title: "METRI — Tracker de fitness de código abierto para lifters",
    description:
      "Calculadoras de fitness gratis, programas y una base de conocimiento. Sin conexión primero y de código abierto.",
  },
};

const HomePageEs = () => (
  <>
    <JsonLd data={[organizationSchema(), websiteSchema()]} />
    <Home />
  </>
);

export default HomePageEs;
