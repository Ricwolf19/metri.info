import { Suspense } from "react";

import { AdminPanelSkeleton } from "@/components/admin/AdminSkeleton";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";

const AnalyticsPostHogPage = () => (
  <Suspense fallback={<AdminPanelSkeleton />}>
    <AnalyticsPanel />
  </Suspense>
);

export default AnalyticsPostHogPage;
