import { BarList } from "@/components/admin/charts/BarList";
import { Card, fmt, Placeholder } from "@/components/admin/ui";
import {
  gaConfigured,
  getGaDeviceBreakdown,
  getGaRealtime,
  getGaSummary,
  getGaTopCountries,
  getGaTopPages,
  getGaTopSources,
  type GaSplit,
} from "@/lib/analytics/ga";

const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#8b5cf6"];

const ConnectHint = () => (
  <Placeholder>
    Connect Google Analytics — set GA4_PROPERTY_ID and GA4_CREDENTIALS_JSON.
  </Placeholder>
);

const Split = ({ last7, last30 }: GaSplit) => (
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

/** Google Analytics 4 reporting via the Data API: active users, sessions,
 * pageviews, realtime and top lists. Each card degrades to a "Connect" hint when
 * the service account isn't configured, and to "No data" when configured but
 * empty — same contract as the PostHog panel so the two sections read alike. */
export const GoogleAnalyticsPanel = async () => {
  const [summary, realtime, topPages, countries, devices, sources] =
    await Promise.all([
      getGaSummary(),
      getGaRealtime(),
      getGaTopPages(),
      getGaTopCountries(),
      getGaDeviceBreakdown(),
      getGaTopSources(),
    ]);

  const configured = gaConfigured();
  const empty = <Placeholder>No Google Analytics data available.</Placeholder>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Active users" subtitle="GA4 · activeUsers">
        {!configured ? (
          <ConnectHint />
        ) : summary ? (
          <Split {...summary.activeUsers} />
        ) : (
          empty
        )}
      </Card>

      <Card title="Sessions" subtitle="GA4 · sessions">
        {!configured ? (
          <ConnectHint />
        ) : summary ? (
          <Split {...summary.sessions} />
        ) : (
          empty
        )}
      </Card>

      <Card title="Pageviews" subtitle="GA4 · screenPageViews">
        {!configured ? (
          <ConnectHint />
        ) : summary ? (
          <Split {...summary.pageviews} />
        ) : (
          empty
        )}
      </Card>

      <Card title="Realtime" subtitle="Active users · last 30 min">
        {!configured ? (
          <ConnectHint />
        ) : realtime !== null ? (
          <p className="font-mono text-3xl font-bold text-ink-50">
            {fmt(realtime)}
          </p>
        ) : (
          empty
        )}
      </Card>

      <Card title="Top pages" subtitle="By pageviews · last 30 days">
        {!configured ? (
          <ConnectHint />
        ) : topPages && topPages.length > 0 ? (
          <BarList items={topPages} />
        ) : (
          empty
        )}
      </Card>

      <Card title="Top sources" subtitle="By sessions · last 30 days">
        {!configured ? (
          <ConnectHint />
        ) : sources && sources.length > 0 ? (
          <BarList items={sources} />
        ) : (
          empty
        )}
      </Card>

      <Card title="Top countries" subtitle="By active users · last 30 days">
        {!configured ? (
          <ConnectHint />
        ) : countries && countries.length > 0 ? (
          <BarList items={countries} />
        ) : (
          empty
        )}
      </Card>

      <Card title="Devices" subtitle="By active users · last 30 days">
        {!configured ? (
          <ConnectHint />
        ) : devices && devices.length > 0 ? (
          <BarList
            items={devices.map((d, i) => ({
              ...d,
              color: COLORS[i % COLORS.length],
            }))}
          />
        ) : (
          empty
        )}
      </Card>
    </div>
  );
};
