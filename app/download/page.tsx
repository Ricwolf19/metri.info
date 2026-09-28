import type { Metadata } from "next";

import { DownloadView } from "@/components/marketing/DownloadView";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Download the Metri app",
  description:
    "Download the Metri beta for Android — a free, open-source, offline-first workout tracker. Direct APK with version, release notes and SHA-256 checksum; iOS coming soon.",
  alternates: metaAlternates("download", "en"),
};

const DownloadPage = () => <DownloadView locale="en" />;

export default DownloadPage;
