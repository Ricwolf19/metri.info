import { Suspense } from "react";

import { AdminPanelSkeleton } from "@/components/admin/AdminSkeleton";
import { GoogleAnalyticsPanel } from "@/components/admin/GoogleAnalyticsPanel";

const AnalyticsGooglePage = () => (
  <Suspense fallback={<AdminPanelSkeleton />}>
    <GoogleAnalyticsPanel />
  </Suspense>
);

export default AnalyticsGooglePage;
