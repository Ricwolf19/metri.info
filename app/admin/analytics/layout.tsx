import { Suspense } from "react";

import {
  AnalyticsTabs,
  AnalyticsTabStrip,
} from "@/components/admin/AnalyticsTabs";
import { PageHeader } from "@/components/admin/ui";

const AnalyticsLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <PageHeader
      title="Analytics"
      description="What people do (PostHog), where they click and how far they scroll (PostHog heatmaps), where they come from (GA4), how Google sees the site (Search Console) and what breaks (Sentry). Every tab reads the same date range; each card says what to connect when its keys aren't set."
    />
    {/* The range lives in the URL, which is request data; until it's read
        the same tabs render without it. */}
    <Suspense fallback={<AnalyticsTabStrip />}>
      <AnalyticsTabs />
    </Suspense>
    {children}
  </>
);

export default AnalyticsLayout;
