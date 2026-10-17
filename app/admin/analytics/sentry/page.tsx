import { Suspense } from "react";

import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { SentryPanel } from "@/components/admin/SentryPanel";

const AnalyticsSentryPage = () => (
  <Suspense fallback={<LoadingScreen label="Loading analytics…" />}>
    <SentryPanel />
  </Suspense>
);

export default AnalyticsSentryPage;
