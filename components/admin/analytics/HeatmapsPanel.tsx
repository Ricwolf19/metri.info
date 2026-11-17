import { CalendarHeatmap } from "@/components/admin/charts/CalendarHeatmap";
import { HourHeatmap } from "@/components/admin/charts/HourHeatmap";
import {
  type Guide,
  PagePreview,
} from "@/components/admin/heatmaps/PagePreview";
import { SourceCard } from "@/components/admin/SourceCard";
import { fmt, Stat } from "@/components/admin/ui";
import { getActivityGrid, getDailyActivity } from "@/lib/analytics/behavior";
import { formatMetric, ratio } from "@/lib/analytics/format";
import {
  depthReachedBy,
  heatGradientCss,
  intensityCap,
  pointStats,
  REACH_MARKERS,
  scrolledPast,
  scrollReachBands,
} from "@/lib/analytics/heat";
import {
  getHeatFold,
  getHeatPoints,
  getHeatZones,
  getScrollDepth,
  previewPath,
} from "@/lib/analytics/heatmap-queries";
import {
  deviceWidthRange,
  HEATMAP_POINT_LIMIT,
  HEATMAP_RETENTION_DAYS,
  type HeatmapParams,
} from "@/lib/analytics/heatmaps";
import {
  ANALYTICS_ZONE_LABEL,
  type AnalyticsWindow,
  windowLabel,
} from "@/lib/analytics/range";

const Legend = ({ low, high }: { low: string; high: string }) => (
  <div className="flex items-center gap-3 font-mono text-[11px] text-ink-400">
    <span>{low}</span>
    <span
      aria-hidden
      className="h-2 w-40 rounded-full"
      style={{ background: heatGradientCss() }}
    />
    <span>{high}</span>
  </div>
);

const Notes = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1 pl-5 text-xs text-ink-400">
    {items.map((n) => (
      <li key={n}>{n}</li>
    ))}
  </ul>
);

/**
 * The page map: heat from PostHog's heatmap data over the live page at the
 * chosen device's viewport. Clicks, rage clicks, dead clicks and movement draw
 * as blobs; scroll depth as bands coloured by the share of visits that got
 * that far.
 */
export const HeatmapSection = async ({
  params,
  window,
  clamped,
}: {
  params: HeatmapParams;
  window: AnalyticsWindow;
  clamped: boolean;
}) => {
  const { page, device, map, agg } = params;
  const scroll = map.id === "scrolldepth";
  const [src, points, fold, buckets, zones] = await Promise.all([
    previewPath(params, window),
    scroll ? Promise.resolve([]) : getHeatPoints(params, window),
    scroll ? Promise.resolve(null) : getHeatFold(params, window),
    scroll ? getScrollDepth(params, window) : Promise.resolve([]),
    scroll ? Promise.resolve([]) : getHeatZones(params, window),
  ]);

  const title = `${map.label} on ${page.label}`;
  const subtitle = `${device.label} (${deviceWidthRange(device)}) · ${agg === "unique" ? "unique visitors" : "every interaction"} · ${windowLabel(window)}`;
  const notes = [
    "English and Spanish visits together, drawn on the English page.",
    page.template
      ? "Every guide's heat together, drawn on the most read one; guides differ in length, so lower spots are approximate."
      : null,
    "Your own visits aren't in it: nothing is tracked inside this preview.",
    "Only visitors who accepted cookies are recorded, and only with heatmaps enabled in the PostHog project's settings.",
    map.id === "deadclick"
      ? "A dead click is a click that changed nothing on the page within a moment."
      : null,
    clamped
      ? `PostHog keeps heatmaps for ${HEATMAP_RETENTION_DAYS} days, so the map starts there.`
      : null,
    !scroll && points && points.length >= HEATMAP_POINT_LIMIT
      ? `Only the ${fmt(HEATMAP_POINT_LIMIT)} busiest spots are drawn.`
      : null,
  ].filter((n): n is string => n !== null);

  if (scroll) {
    return (
      <SourceCard
        source="posthog"
        data={buckets}
        title={title}
        subtitle={subtitle}
        empty="No scroll depth recorded for this page and device in the range."
      >
        {(list) => {
          const bands = scrollReachBands(list);
          const total = list.reduce((n, b) => n + b.count, 0);
          const markers: Guide[] = REACH_MARKERS.map((share) => ({
            y: depthReachedBy(bands, share),
            label: `${Math.round(share * 100)}% of visits reached here`,
          })).filter((m) => m.y > 0);
          const pastFirst = scrolledPast(list, device.height);
          return (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  label={agg === "unique" ? "Visitors" : "Visits"}
                  value={total}
                />
                <Stat
                  label="Half of visits reached"
                  value={depthReachedBy(bands, 0.5)}
                  hint="px from the top"
                />
                <Stat
                  label="Scrolled past the first screen"
                  value={pastFirst}
                  format="percent"
                  hint={`Below ${fmt(device.height)} px`}
                />
                <Stat
                  label="Deepest"
                  value={bands.at(-1)?.bottom ?? 0}
                  hint="px"
                />
              </div>
              <PagePreview
                src={src}
                summary={`${title}: half of visits reached ${fmt(depthReachedBy(bands, 0.5))} px`}
                width={device.width}
                height={device.height}
                points={[]}
                bands={bands}
                markers={markers}
                fold={{
                  y: device.height,
                  label: `First screen (${device.width}×${device.height})`,
                }}
              />
              <Legend low="0% reached" high="100% reached" />
              <Notes items={notes} />
            </div>
          );
        }}
      </SourceCard>
    );
  }

  return (
    <SourceCard
      source="posthog"
      data={points}
      title={title}
      subtitle={subtitle}
      empty={`No ${map.noun} recorded for this page and device in the range.`}
    >
      {(list) => {
        const stats = pointStats(list);
        const foldY = fold?.medianViewport ?? device.height;
        const below = fold ? ratio(fold.belowFold, fold.total) : null;
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {agg === "unique" ? (
                <Stat
                  label="Visitors at the hottest spot"
                  value={stats.hottest}
                />
              ) : (
                <Stat label={`Total ${map.noun}`} value={stats.total} />
              )}
              <Stat
                label="Below the fold"
                value={below}
                format="percent"
                hint={`Under the first ${fmt(foldY)} px`}
              />
              <Stat
                label="On fixed elements"
                value={stats.fixedShare}
                format="percent"
                hint="Header, menus, dialogs"
              />
              <Stat
                label="Distinct spots"
                value={stats.spots}
                hint={
                  stats.spots >= HEATMAP_POINT_LIMIT
                    ? "The busiest only"
                    : undefined
                }
              />
            </div>
            <PagePreview
              src={src}
              summary={`${title}: ${fmt(stats.total)} ${map.noun} across ${fmt(stats.spots)} spots`}
              width={device.width}
              height={device.height}
              points={list}
              bands={[]}
              markers={[]}
              fold={{ y: foldY, label: "Fold" }}
              zones={zones ?? []}
              noun={map.noun}
            />
            <Legend
              low={`Fewer ${map.noun}`}
              high={`${formatMetric(intensityCap(list))}+ ${map.noun}`}
            />
            <Notes items={notes} />
          </div>
        );
      }}
    </SourceCard>
  );
};

/** When people browse: pageviews by weekday and hour, the full range. */
export const ActivitySection = async ({
  window,
  agg,
}: {
  window: AnalyticsWindow;
  agg: HeatmapParams["agg"];
}) => {
  const cells = await getActivityGrid(window, agg);
  return (
    <SourceCard
      source="posthog"
      data={cells}
      title="When people browse"
      subtitle={`${agg === "unique" ? "Visitors" : "Pageviews"} by weekday and hour · ${ANALYTICS_ZONE_LABEL} time`}
      isEmpty={(c) => c.flat().every((n) => n === 0)}
    >
      {(c) => (
        <HourHeatmap
          cells={c}
          title="Pageviews by weekday and hour"
          zone={ANALYTICS_ZONE_LABEL}
        />
      )}
    </SourceCard>
  );
};

/** Day by day across the full range. */
export const CalendarSection = async ({
  window,
  agg,
}: {
  window: AnalyticsWindow;
  agg: HeatmapParams["agg"];
}) => {
  const days = await getDailyActivity(window, agg);
  return (
    <SourceCard
      source="posthog"
      data={days}
      title="Day by day"
      subtitle={`${agg === "unique" ? "Visitors" : "Pageviews"} per day · ${ANALYTICS_ZONE_LABEL} time`}
      isEmpty={(d) => d.every((x) => x.count === 0)}
    >
      {(d) => <CalendarHeatmap days={d} title="Pageviews per day" />}
    </SourceCard>
  );
};
