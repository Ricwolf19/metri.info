import { Suspense } from "react";

import { AdminPanelSkeleton } from "@/components/admin/AdminSkeleton";
import { SentryPanel } from "@/components/admin/SentryPanel";

const AnalyticsSentryPage = () => (
  <Suspense fallback={<AdminPanelSkeleton />}>
    <SentryPanel />
  </Suspense>
);

export default AnalyticsSentryPage;
