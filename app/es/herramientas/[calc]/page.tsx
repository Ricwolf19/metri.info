import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CalculatorPage } from "@/components/calculators/CalculatorPage";
import { CALC_CONTENT } from "@/lib/calculators/content";
import {
  CALC_IDS,
  calcIdForSlug,
  metaAlternates,
  ROUTES,
} from "@/lib/i18n/routes";

export const dynamicParams = false;

export const generateStaticParams = () =>
  CALC_IDS.map((id) => ({ calc: ROUTES[id].es.split("/").pop() as string }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ calc: string }>;
}): Promise<Metadata> => {
  const { calc } = await params;
  const id = calcIdForSlug("es", calc);
  if (!id) return {};
  const c = CALC_CONTENT[id].es;
  return {
    title: c.seoTitle,
    description: c.seoDescription,
    alternates: metaAlternates(id, "es"),
    openGraph: { title: c.seoTitle, description: c.seoDescription },
  };
};

const CalcRouteEs = async ({
  params,
}: {
  params: Promise<{ calc: string }>;
}) => {
  const { calc } = await params;
  const id = calcIdForSlug("es", calc);
  if (!id) notFound();
  return <CalculatorPage locale="es" id={id} />;
};

export default CalcRouteEs;
