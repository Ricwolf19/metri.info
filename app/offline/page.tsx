import type { Metadata } from "next";

import { OfflineView } from "@/components/pwa/OfflineView";

export const metadata: Metadata = {
  title: "Offline",
  description: "You're offline — cached Metri calculators still work.",
  robots: { index: false, follow: false },
};

const OfflinePage = () => <OfflineView />;

export default OfflinePage;
