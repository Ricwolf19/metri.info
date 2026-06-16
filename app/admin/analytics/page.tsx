import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { GoogleAnalyticsPanel } from "@/components/admin/GoogleAnalyticsPanel";
import { PageHeader } from "@/components/admin/ui";

/** Small section divider — keeps the two analytics sources visually distinct
 * (PostHog vs GA4) so they can be compared side by side. */
const SectionTitle = ({ title, hint }: { title: string; hint: string }) => (
  <div className="mt-10 mb-4 first:mt-0">
    <h2 className="text-lg font-semibold text-ink-50">{title}</h2>
    <p className="mt-0.5 text-sm text-ink-400">{hint}</p>
  </div>
);

const AnalyticsPage = () => (
  <>
    <PageHeader
      title="Analytics"
      description="Two analytics sources side by side. PostHog (events, replays, funnels) via its Query API; Google Analytics via the GA4 Data API. Each card prompts to connect when its keys aren't set."
    />

    <SectionTitle
      title="PostHog"
      hint="Query API · pageviews, calculator usage, custom events. Realtime, no sampling."
    />
    <AnalyticsPanel />

    <SectionTitle
      title="Google Analytics"
      hint="GA4 Data API · active users, sessions, sources, geography. Note: GA processes with a delay and may sample large ranges."
    />
    <GoogleAnalyticsPanel />
  </>
);

export default AnalyticsPage;
