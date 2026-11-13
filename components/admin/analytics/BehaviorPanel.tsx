import { BarList, type BarItem } from "@/components/admin/charts/BarList";
import { FunnelChart } from "@/components/admin/charts/FunnelChart";
import { TrendTabs } from "@/components/admin/charts/TrendTabs";
import { SourceCard, SourceNotice } from "@/components/admin/SourceCard";
import { Card, fmt, Placeholder, Stat } from "@/components/admin/ui";
import {
  type BreakdownId,
  FUNNELS,
  type FunnelId,
  getBehaviorSummary,
  getBreakdown,
  getDailyVisits,
  getFunnel,
  type RankedRow,
} from "@/lib/analytics/behavior";
import { ratio } from "@/lib/analytics/format";
import {
  ANALYTICS_ZONE_LABEL,
  type AnalyticsWindow,
} from "@/lib/analytics/range";
import { sourceMode } from "@/lib/analytics/sources";

const BREAKDOWN_CARDS: {
  id: BreakdownId;
  title: string;
  subtitle: string;
  people?: string;
}[] = [
  { id: "pages", title: "Top pages", subtitle: "Pageviews", people: "people" },
  { id: "entryPages", title: "Entry pages", subtitle: "Where sessions start" },
  {
    id: "sources",
    title: "Sources",
    subtitle: "Referrer of each session's first page",
  },
  {
    id: "guides",
    title: "Guides read",
    subtitle: "Guide pageviews, both languages",
    people: "readers",
  },
  {
    id: "calculators",
    title: "Calculators used",
    subtitle: "calculator_used events",
    people: "people",
  },
  {
    id: "languages",
    title: "Language",
    subtitle: "Visitors by the language of the pages they read",
    people: "pageviews",
  },
  {
    id: "countries",
    title: "Countries",
    subtitle: "Visitors by GeoIP country",
  },
  { id: "devices", title: "Devices", subtitle: "Visitors by device type" },
  { id: "browsers", title: "Browsers", subtitle: "Visitors by browser" },
  {
    id: "events",
    title: "Product events",
    subtitle: "Every custom event, PostHog's own excluded",
  },
];

const FUNNEL_IDS = Object.keys(FUNNELS) as FunnelId[];

const toBars = (rows: RankedRow[], people?: string): BarItem[] =>
  rows.map((r) => ({
    label: r.label,
    value: r.value,
    hint:
      people && r.people !== undefined
        ? `${fmt(r.people)} ${people}`
        : undefined,
  }));

/**
 * PostHog: what people do on the site in the window. Product events up top,
 * the daily trend, the three funnels that matter (sign-up, app download,
 * knowledge check) and where visits come from. Visitors are people PostHog
 * could tell apart; anyone who declined cookies isn't counted.
 */
export const BehaviorPanel = async ({
  window,
}: {
  window: AnalyticsWindow;
}) => {
  if (sourceMode("posthog") === "off") return <SourceNotice source="posthog" />;

  const [summary, daily, funnels, breakdowns] = await Promise.all([
    getBehaviorSummary(window),
    getDailyVisits(window),
    Promise.all(FUNNEL_IDS.map((id) => getFunnel(id, window))),
    Promise.all(BREAKDOWN_CARDS.map((c) => getBreakdown(c.id, window))),
  ]);

  const quizRate = summary
    ? ratio(summary.quizCompleted, summary.quizStarted)
    : null;

  return (
    <div className="space-y-6">
      <SourceNotice source="posthog" />
      {summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Visitors"
            value={summary.visitors}
            hint="People with a pageview"
          />
          <Stat label="Pageviews" value={summary.pageviews} />
          <Stat label="Calculator uses" value={summary.calculatorUses} />
          <Stat
            label="Saved calculations"
            value={summary.calculationsSaved}
            hint="By signed-in people"
          />
          <Stat label="Guide views" value={summary.guideViews} />
          <Stat
            label="Knowledge checks finished"
            value={summary.quizCompleted}
            hint={
              quizRate === null
                ? "None started"
                : `${Math.round(quizRate * 100)}% of ${fmt(summary.quizStarted)} started`
            }
          />
          <Stat
            label="APK downloads"
            value={summary.apkDownloads}
            hint="Download button taps"
          />
          <Stat
            label="Sign-ups"
            value={summary.signups}
            hint="Accounts created"
          />
        </div>
      ) : (
        <Card title="Activity">
          <Placeholder>
            PostHog didn&apos;t answer. Try again in a minute.
          </Placeholder>
        </Card>
      )}

      <SourceCard
        source="posthog"
        data={daily}
        title="Daily visits"
        subtitle={`Pageviews by day, ${ANALYTICS_ZONE_LABEL} time`}
        isEmpty={(d) => d.pageviews.every((p) => p.value === 0)}
      >
        {(d) => (
          <TrendTabs
            views={[
              { id: "visitors", label: "Visitors", points: d.visitors },
              {
                id: "pageviews",
                label: "Pageviews",
                points: d.pageviews,
              },
            ]}
          />
        )}
      </SourceCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {FUNNEL_IDS.map((id, i) => (
          <SourceCard
            key={id}
            source="posthog"
            data={funnels[i]}
            title={FUNNELS[id].title}
            subtitle={`${FUNNELS[id].subtitle} · in order, within 7 days`}
            isEmpty={(steps) => (steps[0]?.count ?? 0) === 0}
          >
            {(steps) => <FunnelChart steps={steps} />}
          </SourceCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {BREAKDOWN_CARDS.map((card, i) => (
          <SourceCard
            key={card.id}
            source="posthog"
            data={breakdowns[i]}
            title={card.title}
            subtitle={card.subtitle}
          >
            {(rows) => <BarList items={toBars(rows, card.people)} />}
          </SourceCard>
        ))}
      </div>
    </div>
  );
};
