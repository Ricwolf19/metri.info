import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { PageHeader } from "@/components/admin/ui";

const AnalyticsPage = () => (
  <>
    <PageHeader
      title="Analytics"
      description="Product analytics from PostHog's Query API — pageviews, calculator usage and top lists. Cards prompt to connect PostHog when its API key isn't set."
    />
    <AnalyticsPanel />
  </>
);

export default AnalyticsPage;
