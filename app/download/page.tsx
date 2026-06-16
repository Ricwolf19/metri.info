import type { Metadata } from "next";

import { DownloadView } from "@/components/marketing/DownloadView";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Download the Metri app",
  description:
    "Metri for iOS and Android is in development. Meanwhile, use every fitness calculator free on the web.",
  alternates: metaAlternates("download", "en"),
};

const DownloadPage = () => <DownloadView locale="en" />;

export default DownloadPage;
