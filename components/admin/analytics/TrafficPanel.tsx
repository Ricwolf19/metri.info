import { BarList } from "@/components/admin/charts/BarList";
import { TrendTabs } from "@/components/admin/charts/TrendTabs";
import { SourceCard, SourceNotice } from "@/components/admin/SourceCard";
import { Card, fmt, Placeholder, Stat } from "@/components/admin/ui";
import {
  type GaBreakdownId,
  getGaBreakdown,
  getGaDaily,
  getGaRealtime,
  getGaSummary,
} from "@/lib/analytics/ga";
import type { AnalyticsWindow } from "@/lib/analytics/range";
import { sourceMode } from "@/lib/analytics/sources";

const BREAKDOWN_CARDS: {
  id: GaBreakdownId;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "channels",
    title: "Channels",
    subtitle: "Sessions by default channel group",
  },
  { id: "sourceMedium", title: "Source / medium", subtitle: "Sessions" },
  {
    id: "landingPages",
    title: "Landing pages",
    subtitle: "Sessions by the page they started on",
  },
  { id: "pages", title: "Top pages", subtitle: "Pageviews" },
  { id: "countries", title: "Countries", subtitle: "Active users" },
  { id: "devices", title: "Devices", subtitle: "Active users" },
  { id: "browsers", title: "Browsers", subtitle: "Active users" },
  { id: "newVsReturning", title: "New vs returning", subtitle: "Active users" },
];

/**
 * GA4: who arrives and from where. Headline numbers for the window, the
 * daily trend, who's on the site right now and every acquisition breakdown.
 * GA4 counts days in its property's own time zone.
 */
export const TrafficPanel = async ({ window }: { window: AnalyticsWindow }) => {
  if (sourceMode("ga") === "off") return <SourceNotice source="ga" />;

  const [summary, daily, realtime, breakdowns] = await Promise.all([
    getGaSummary(window),
    getGaDaily(window),
    getGaRealtime(),
    Promise.all(BREAKDOWN_CARDS.map((c) => getGaBreakdown(c.id, window))),
  ]);

  return (
    <div className="space-y-6">
      <SourceNotice source="ga" />
      {summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Active users" value={summary.activeUsers} />
          <Stat label="New users" value={summary.newUsers} />
          <Stat label="Sessions" value={summary.sessions} />
          <Stat label="Pageviews" value={summary.pageviews} />
          <Stat
            label="Engagement rate"
            value={summary.engagementRate}
            format="percent"
            hint="Sessions of 10 s+, 2+ pages or a key event"
          />
          <Stat
            label="Engagement time"
            value={summary.engagementPerUser}
            format="duration"
            hint="Per active user"
          />
        </div>
      ) : (
        <Card title="Visitors">
          <Placeholder>
            Google Analytics didn&apos;t answer. Try again in a minute.
          </Placeholder>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SourceCard
          source="ga"
          data={daily}
          title="Daily traffic"
          subtitle="GA4, by the property's day"
          className="lg:col-span-2"
          isEmpty={(d) => d.users.every((p) => p.value === 0)}
        >
          {(d) => (
            <TrendTabs
              views={[
                {
                  id: "users",
                  label: "Users",
                  points: d.users,
                },
                {
                  id: "sessions",
                  label: "Sessions",
                  points: d.sessions,
                },
                {
                  id: "pageviews",
                  label: "Pageviews",
                  points: d.pageviews,
                },
              ]}
            />
          )}
        </SourceCard>
        <SourceCard
          source="ga"
          data={realtime}
          title="Right now"
          subtitle="Active users · last 30 minutes"
          isEmpty={() => false}
        >
          {(r) => (
            <div className="space-y-4">
              <p className="font-mono text-3xl font-bold text-ink-50">
                {fmt(r.activeUsers)}
                <span className="ml-2 text-xs font-normal text-ink-400">
                  on the site
                </span>
              </p>
              {r.pages.length > 0 ? (
                <BarList items={r.pages} />
              ) : (
                <Placeholder>Nobody&apos;s on a page right now.</Placeholder>
              )}
            </div>
          )}
        </SourceCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {BREAKDOWN_CARDS.map((card, i) => (
          <SourceCard
            key={card.id}
            source="ga"
            data={breakdowns[i]}
            title={card.title}
            subtitle={card.subtitle}
          >
            {(rows) => <BarList items={rows} />}
          </SourceCard>
        ))}
      </div>
    </div>
  );
};
