import type { Metadata } from "next";

import { DownloadView } from "@/components/marketing/DownloadView";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Descarga la app de METRI",
  description:
    "METRI para iOS y Android está en desarrollo. Mientras tanto, usa todas las calculadoras de fitness gratis en la web.",
  alternates: metaAlternates("download", "es"),
};

const DescargarPage = () => <DownloadView locale="es" />;

export default DescargarPage;
