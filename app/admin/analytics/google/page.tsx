import { Suspense } from "react";

import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { GoogleAnalyticsPanel } from "@/components/admin/GoogleAnalyticsPanel";

const AnalyticsGooglePage = () => (
  <Suspense fallback={<LoadingScreen label="Loading analytics…" />}>
    <GoogleAnalyticsPanel />
  </Suspense>
);

export default AnalyticsGooglePage;
