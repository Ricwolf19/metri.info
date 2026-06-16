import { BarList } from "@/components/admin/charts/BarList";
import { Card, fmt, Placeholder } from "@/components/admin/ui";
import {
  getCalcUsageTotals,
  getPageviewTotals,
  getTopCalcUsage,
  getTopPages,
  posthogConfigured,
} from "@/lib/analytics/posthog";
import { CALC_CONTENT } from "@/lib/calculators/content";
import type { CalcId } from "@/lib/calculators/types";

const calcName = (id: string) => CALC_CONTENT[id as CalcId]?.en.h1 ?? id;

const COLORS = ["#84cc16", "#38bdf8", "#f59e0b", "#8b5cf6", "#22c55e"];

const ConnectHint = () => (
  <Placeholder>
    Connect PostHog — set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID.
  </Placeholder>
);

const Split = ({ last7, last30 }: { last7: number; last30: number }) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-xs text-ink-400">Last 7 days</p>
      <p className="mt-1 font-mono text-2xl font-bold text-ink-50">
        {fmt(last7)}
      </p>
    </div>
    <div>
      <p className="text-xs text-ink-400">Last 30 days</p>
      <p className="mt-1 font-mono text-2xl font-bold text-ink-50">
        {fmt(last30)}
      </p>
    </div>
  </div>
);

/** PostHog product analytics: pageviews, calculator usage and top lists from the
 * Query API. Every card degrades to a "Connect PostHog" hint when the personal
 * API key isn't set, and to "No data" when configured but empty. */
export const AnalyticsPanel = async () => {
  const [pageviews, topPages, calcUsage, topCalcUsage] = await Promise.all([
    getPageviewTotals(),
    getTopPages(),
    getCalcUsageTotals(),
    getTopCalcUsage(),
  ]);

  const phConfigured = posthogConfigured();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Pageviews" subtitle="$pageview events">
        {!phConfigured ? (
          <ConnectHint />
        ) : pageviews ? (
          <Split last7={pageviews.last7} last30={pageviews.last30} />
        ) : (
          <Placeholder>No PostHog data available.</Placeholder>
        )}
      </Card>

      <Card title="Calculator usage" subtitle="calculator_used events">
        {!phConfigured ? (
          <ConnectHint />
        ) : calcUsage ? (
          <Split last7={calcUsage.last7} last30={calcUsage.last30} />
        ) : (
          <Placeholder>No PostHog data available.</Placeholder>
        )}
      </Card>

      <Card title="Top pages" subtitle="By pageviews · last 30 days">
        {!phConfigured ? (
          <ConnectHint />
        ) : topPages && topPages.length > 0 ? (
          <BarList
            items={topPages.map((p) => ({ label: p.path, value: p.views }))}
          />
        ) : (
          <Placeholder>No PostHog data available.</Placeholder>
        )}
      </Card>

      <Card
        title="Top calculators by usage"
        subtitle="calculator_used · last 30 days"
      >
        {!phConfigured ? (
          <ConnectHint />
        ) : topCalcUsage && topCalcUsage.length > 0 ? (
          <BarList
            items={topCalcUsage.map((c, i) => ({
              label: calcName(c.calculator),
              value: c.uses,
              color: COLORS[i % COLORS.length],
            }))}
          />
        ) : (
          <Placeholder>No PostHog data available.</Placeholder>
        )}
      </Card>
    </div>
  );
};
