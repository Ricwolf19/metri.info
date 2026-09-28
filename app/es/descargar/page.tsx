import type { Metadata } from "next";

import { DownloadView } from "@/components/marketing/DownloadView";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Descarga la app de Metri",
  description:
    "Descarga la beta de Metri para Android — un registro de entrenamientos gratis, de código abierto y sin conexión primero. APK directo con versión, notas y checksum SHA-256; iOS próximamente.",
  alternates: metaAlternates("download", "es"),
};

const DescargarPage = () => <DownloadView locale="es" />;

export default DescargarPage;
