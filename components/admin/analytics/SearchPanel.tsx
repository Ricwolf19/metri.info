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
import { formatInstant, formatMetric } from "@/lib/analytics/format";
import { type AnalyticsWindow, fillDays } from "@/lib/analytics/range";
import {
  deviceName,
  type Opportunity,
  pagePath,
  type SearchRow,
  type Sitemap,
  sitemapStatus,
  strikingDistance,
  underperforming,
} from "@/lib/analytics/search";
import { getSitemaps, querySearch } from "@/lib/analytics/search-console";
import { sourceMode } from "@/lib/analytics/sources";
import { absoluteUrl, cn } from "@/lib/utils";

const num = "text-right font-mono tabular-nums";

/** A day with no impressions has no position; the line holds the last one
 * instead of diving to zero (which would read as "ranked first"). */
const carryForward = (points: { date: string; value: number }[]) => {
  let last = 0;
  return points.map((p) => {
    if (p.value > 0) last = p.value;
    return { date: p.date, value: p.value > 0 ? p.value : last };
  });
};

const RowsTable = ({
  rows,
  label,
  gain,
}: {
  rows: (SearchRow | Opportunity)[];
  label: string;
  gain?: string;
}) => (
  <Table frameClassName="my-0">
    <TableHeader>
      <TableRow>
        <TableHead>{label}</TableHead>
        <TableHead className="text-right">Clicks</TableHead>
        <TableHead className="text-right">Impr.</TableHead>
        <TableHead className="text-right">CTR</TableHead>
        <TableHead className="text-right">Pos.</TableHead>
        {gain ? <TableHead className="text-right">{gain}</TableHead> : null}
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((r) => (
        <TableRow key={r.keys.join("|")}>
          <TableCell
            className="max-w-72 truncate text-ink-100"
            title={r.keys[0]}
          >
            {label === "Page" ? pagePath(r.keys[0] ?? "") : r.keys[0]}
          </TableCell>
          <TableCell className={num}>{fmt(r.clicks)}</TableCell>
          <TableCell className={num}>{fmt(r.impressions)}</TableCell>
          <TableCell className={num}>
            {formatMetric(r.ctr, "percent")}
          </TableCell>
          <TableCell className={num}>
            {formatMetric(r.position, "position")}
          </TableCell>
          {gain && "gain" in r ? (
            <TableCell className={cn(num, "text-lime-400")}>
              +{fmt(r.gain)}
            </TableCell>
          ) : null}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const STATUS_LABEL: Record<ReturnType<typeof sitemapStatus>, string> = {
  errors: "Errors",
  pending: "Pending",
  warnings: "Warnings",
  ok: "OK",
};

const SitemapsTable = ({ sitemaps }: { sitemaps: Sitemap[] }) => (
  <Table frameClassName="my-0">
    <TableHeader>
      <TableRow>
        <TableHead>Sitemap</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">URLs</TableHead>
        <TableHead>Last read</TableHead>
        <TableHead>Submitted</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {sitemaps.map((s) => {
        const status = sitemapStatus(s);
        return (
          <TableRow key={s.path}>
            <TableCell className="font-mono text-xs text-ink-100">
              {pagePath(s.path)}
              {s.isIndex ? " (index)" : ""}
            </TableCell>
            <TableCell
              className={cn(
                "font-mono text-xs",
                status === "ok" ? "text-lime-400" : "text-flame",
              )}
            >
              {STATUS_LABEL[status]}
              {s.errors > 0 ? ` · ${s.errors}` : ""}
            </TableCell>
            <TableCell className={num}>{fmt(s.submitted)}</TableCell>
            <TableCell className="text-xs">
              {formatInstant(s.lastDownloaded)}
            </TableCell>
            <TableCell className="text-xs">
              {formatInstant(s.lastSubmitted)}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

/**
 * Search Console: how Google Search sends people here. Final data only, so
 * the window ends about three days back (the page says so). Opportunities
 * rank the queries where a title or a little more content would earn clicks
 * the impressions already show.
 */
export const SearchPanel = async ({ window }: { window: AnalyticsWindow }) => {
  if (sourceMode("gsc") === "off") return <SourceNotice source="gsc" />;

  const [totals, daily, queries, pages, countries, devices, sitemaps] =
    await Promise.all([
      querySearch(window),
      querySearch(window, ["date"], window.days + 1),
      querySearch(window, ["query"], 1000),
      querySearch(window, ["page"], 25),
      querySearch(window, ["country"], 10),
      querySearch(window, ["device"], 3),
      getSitemaps(),
    ]);

  const total = totals?.[0] ?? null;
  const series = (pick: (r: SearchRow) => number) =>
    fillDays(
      window,
      new Map((daily ?? []).map((r) => [r.keys[0] ?? "", pick(r)])),
    );

  return (
    <div className="space-y-6">
      <SourceNotice source="gsc" />
      {totals ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Clicks" value={total?.clicks ?? 0} />
          <Stat label="Impressions" value={total?.impressions ?? 0} />
          <Stat
            label="CTR"
            value={total?.ctr ?? 0}
            format="percent"
            hint="Clicks per impression"
          />
          <Stat
            label="Average position"
            value={total && total.impressions > 0 ? total.position : null}
            format="position"
            hint="Lower is better"
          />
        </div>
      ) : (
        <Card title="Google Search">
          <Placeholder>
            Search Console didn&apos;t answer. Try again in a minute.
          </Placeholder>
        </Card>
      )}

      <SourceCard
        source="gsc"
        data={daily}
        title="Search performance"
        subtitle="Google Search by day, Pacific time"
      >
        {() => (
          <TrendTabs
            views={[
              {
                id: "clicks",
                label: "Clicks",
                points: series((r) => r.clicks),
              },
              {
                id: "impressions",
                label: "Impressions",
                points: series((r) => r.impressions),
              },
              {
                id: "ctr",
                label: "CTR",
                points: series((r) => r.ctr),
                format: "percent",
                aggregate: "mean",
              },
              {
                id: "position",
                label: "Position",
                points: carryForward(series((r) => r.position)),
                format: "position",
                aggregate: "mean",
                lowerIsBetter: true,
              },
            ]}
          />
        )}
      </SourceCard>

      <SourceCard
        source="gsc"
        data={queries}
        title="Top queries"
        subtitle="By clicks · Google withholds rare queries for privacy, so these don't add up to the total"
        empty="No query has an impression in this range yet."
      >
        {(rows) => (
          <RowsTable
            rows={[...rows]
              .sort(
                (a, b) => b.clicks - a.clicks || b.impressions - a.impressions,
              )
              .slice(0, 15)}
            label="Query"
          />
        )}
      </SourceCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SourceCard
          source="gsc"
          data={queries ? underperforming(queries) : null}
          title="Seen, not clicked"
          subtitle="Page one, under half the usual click-through: rewrite the title and description"
          empty="No page-one query is falling short of its click-through. Good."
        >
          {(rows) => <RowsTable rows={rows} label="Query" gain="Missed" />}
        </SourceCard>
        <SourceCard
          source="gsc"
          data={queries ? strikingDistance(queries) : null}
          title="Striking distance"
          subtitle="Ranking 8–20: a stronger page could move these onto page one"
          empty="Nothing ranks between 8 and 20 yet."
        >
          {(rows) => <RowsTable rows={rows} label="Query" gain="At #3" />}
        </SourceCard>
      </div>

      <SourceCard
        source="gsc"
        data={pages}
        title="Top pages"
        subtitle="By clicks"
      >
        {(rows) => <RowsTable rows={rows} label="Page" />}
      </SourceCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SourceCard
          source="gsc"
          data={countries}
          title="Countries"
          subtitle="Clicks"
        >
          {(rows) => (
            <BarList
              items={rows.map((r) => ({
                label: (r.keys[0] ?? "").toUpperCase(),
                value: r.clicks,
                hint: `${fmt(r.impressions)} impressions · position ${formatMetric(r.position, "position")}`,
              }))}
            />
          )}
        </SourceCard>
        <SourceCard
          source="gsc"
          data={devices}
          title="Devices"
          subtitle="Clicks"
        >
          {(rows) => (
            <BarList
              items={rows.map((r) => ({
                label: deviceName(r.keys[0] ?? ""),
                value: r.clicks,
                hint: `${fmt(r.impressions)} impressions · ${formatMetric(r.ctr, "percent")} CTR`,
              }))}
            />
          )}
        </SourceCard>
      </div>

      <SourceCard
        source="gsc"
        data={sitemaps}
        title="Sitemaps"
        subtitle="What Search Console has on file"
        empty={`No sitemap on file. Submit ${absoluteUrl("/sitemap.xml")} in Search Console.`}
      >
        {(list) => <SitemapsTable sitemaps={list} />}
      </SourceCard>
    </div>
  );
};
