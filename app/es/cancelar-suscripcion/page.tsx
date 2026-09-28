import type { Metadata } from "next";

import { UnsubscribeView } from "@/components/account/UnsubscribeView";
import { createT } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: createT("es")("unsubscribe.metaTitle"),
  robots: { index: false, follow: false },
};

const CancelarSuscripcionPage = ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => <UnsubscribeView locale="es" searchParams={searchParams} />;

export default CancelarSuscripcionPage;
