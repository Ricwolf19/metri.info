import { BarList } from "@/components/admin/charts/BarList";
import { TrendTabs } from "@/components/admin/charts/TrendTabs";
import { SourceCard, SourceNotice } from "@/components/admin/SourceCard";
import { Card, fmt, Placeholder, Stat } from "@/components/admin/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SentryIssue } from "@/lib/analytics/errors";
import { formatInstant } from "@/lib/analytics/format";
import type { AnalyticsWindow } from "@/lib/analytics/range";
import {
  getSentryBreakdown,
  getSentryDaily,
  getSentryErrorTotals,
  getTopSentryIssues,
  type SentryBreakdownId,
} from "@/lib/analytics/sentry";
import { sourceMode } from "@/lib/analytics/sources";

const BREAKDOWN_CARDS: { id: SentryBreakdownId; title: string }[] = [
  { id: "release", title: "By release" },
  { id: "page", title: "By route" },
  { id: "browser", title: "By browser" },
  { id: "os", title: "By operating system" },
];

/** Errors draw in the flame token. */
const ERROR = "rgb(var(--flame))";

const IssuesTable = ({ issues }: { issues: SentryIssue[] }) => (
  <Table frameClassName="my-0">
    <TableHeader>
      <TableRow>
        <TableHead>Issue</TableHead>
        <TableHead className="text-right">Events</TableHead>
        <TableHead className="text-right">Users</TableHead>
        <TableHead>Last seen</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {issues.map((i) => (
        <TableRow key={i.id}>
          <TableCell className="max-w-md">
            {i.permalink ? (
              <a
                href={i.permalink}
                target="_blank"
                rel="noreferrer noopener"
                className="block truncate font-medium text-ink-100 hover:text-brand"
              >
                {i.title}
              </a>
            ) : (
              <span className="block truncate font-medium text-ink-100">
                {i.title}
              </span>
            )}
            <span className="block truncate font-mono text-[11px] text-ink-500">
              {[i.shortId, i.level, i.culprit].filter(Boolean).join(" · ")}
            </span>
          </TableCell>
          <TableCell className="text-right font-mono text-flame">
            {fmt(i.count)}
          </TableCell>
          <TableCell className="text-right font-mono">{fmt(i.users)}</TableCell>
          <TableCell className="text-xs whitespace-nowrap">
            {formatInstant(i.lastSeen, true)}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/**
 * Sentry: what breaks. The 24-hour and 14-day volume whatever the window
 * (the two numbers worth a daily glance), then errors per day, the unresolved
 * issues behind them and where they cluster. Sentry is read for the last 90
 * days at most.
 */
export const ErrorsPanel = async ({
  window,
  today,
}: {
  window: AnalyticsWindow;
  today: string;
}) => {
  if (sourceMode("sentry") === "off") return <SourceNotice source="sentry" />;

  const [totals, daily, issues, breakdowns] = await Promise.all([
    getSentryErrorTotals(),
    getSentryDaily(window, today),
    getTopSentryIssues(window, today),
    Promise.all(
      BREAKDOWN_CARDS.map((c) => getSentryBreakdown(c.id, window, today)),
    ),
  ]);

  return (
    <div className="space-y-6">
      <SourceNotice source="sentry" />
      {totals ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Stat label="Errors · 24 hours" value={totals.last24h} />
          <Stat
            label="Errors · 14 days"
            value={totals.last14d}
            hint={`About ${fmt(Math.round(totals.last14d / 14))} a day`}
          />
        </div>
      ) : (
        <Card title="Error volume">
          <Placeholder>
            Sentry didn&apos;t answer. Try again in a minute.
          </Placeholder>
        </Card>
      )}

      <SourceCard
        source="sentry"
        data={daily}
        title="Errors per day"
        subtitle="Accepted error events"
        empty="No errors in this range."
        isEmpty={(d) => d.every((p) => p.value === 0)}
      >
        {(d) => (
          <TrendTabs
            views={[{ id: "errors", label: "Errors", points: d, color: ERROR }]}
          />
        )}
      </SourceCard>

      <SourceCard
        source="sentry"
        data={issues}
        title="Unresolved issues"
        subtitle="Seen in this range, most events first · open one in Sentry"
        empty="No unresolved issue in this range. Good."
      >
        {(list) => <IssuesTable issues={list} />}
      </SourceCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {BREAKDOWN_CARDS.map((card, i) => (
          <SourceCard
            key={card.id}
            source="sentry"
            data={breakdowns[i]}
            title={card.title}
            subtitle="Error events"
            empty="No errors in this range."
          >
            {(rows) => (
              <BarList items={rows.map((r) => ({ ...r, color: ERROR }))} />
            )}
          </SourceCard>
        ))}
      </div>
    </div>
  );
};
