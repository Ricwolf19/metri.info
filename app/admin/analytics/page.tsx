import { Suspense } from "react";

import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";

const AnalyticsPostHogPage = () => (
  <Suspense fallback={<LoadingScreen label="Loading analytics…" />}>
    <AnalyticsPanel />
  </Suspense>
);

export default AnalyticsPostHogPage;
