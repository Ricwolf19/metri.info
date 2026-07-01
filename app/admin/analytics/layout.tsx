import { AnalyticsTabs } from "@/components/admin/AnalyticsTabs";
import { PageHeader } from "@/components/admin/ui";

const AnalyticsLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <PageHeader
      title="Analytics"
      description="Three sources, one per tab. PostHog (events, funnels) via its Query API; Google Analytics via the GA4 Data API; Sentry (errors, issues) via the Sentry API. Each card prompts to connect when its keys aren't set."
    />
    <AnalyticsTabs />
    {children}
  </>
);

export default AnalyticsLayout;
