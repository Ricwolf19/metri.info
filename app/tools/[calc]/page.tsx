import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComingSoon } from "@/components/shared/ComingSoon";
import { ROUTES } from "@/lib/i18n/routes";

const CALC_SLUGS = Object.values(ROUTES)
  .filter((r) => r.en.startsWith("/tools/"))
  .map((r) => r.en.split("/").pop() as string);

export const dynamicParams = false;

export const generateStaticParams = () => CALC_SLUGS.map((calc) => ({ calc }));

export const metadata: Metadata = {
  title: "Calculator",
  robots: { index: false },
};

const CalculatorPage = async ({
  params,
}: {
  params: Promise<{ calc: string }>;
}) => {
  const { calc } = await params;
  if (!CALC_SLUGS.includes(calc)) notFound();
  return <ComingSoon titleKey="nav.tools" />;
};

export default CalculatorPage;
