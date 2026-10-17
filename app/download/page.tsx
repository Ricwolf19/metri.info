import type { Metadata } from "next";

import { DownloadView } from "@/components/marketing/DownloadView";
import { sectionMetadata } from "@/lib/seo/pages";

export const metadata: Metadata = sectionMetadata("download", "en");

const DownloadPage = () => <DownloadView locale="en" />;

export default DownloadPage;
