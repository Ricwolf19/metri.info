import { Suspense } from "react";

import {
  ActivitySection,
  CalendarSection,
  HeatmapSection,
} from "@/components/admin/analytics/HeatmapsPanel";
import { HeatmapControls } from "@/components/admin/heatmaps/HeatmapControls";
import { RangeBar } from "@/components/admin/RangeBar";
import { SourceNotice } from "@/components/admin/SourceCard";
import { AdminSkeleton } from "@/components/skeletons/AdminSkeleton";
import {
  deviceWidthRange,
  HEATMAP_AGGS,
  HEATMAP_DEFAULTS,
  HEATMAP_DEVICES,
  HEATMAP_MAPS,
  HEATMAP_PAGES,
  HEATMAP_RETENTION_DAYS,
  parseHeatmapParams,
} from "@/lib/analytics/heatmaps";
import { clampWindow, type SearchParams } from "@/lib/analytics/range";
import { readAnalyticsRequest, windowKey } from "@/lib/analytics/request";
import { sourceMode } from "@/lib/analytics/sources";

type Props = { searchParams: Promise<SearchParams> };

const OPTIONS = {
  page: HEATMAP_PAGES.map((p) => ({
    id: p.id,
    label: p.label,
    hint: p.template ? "Every guide, drawn on the most read" : p.path,
  })),
  device: HEATMAP_DEVICES.map((d) => ({
    id: d.id,
    label: d.label,
    hint: deviceWidthRange(d),
  })),
  map: HEATMAP_MAPS.map((m) => ({ id: m.id, label: m.label })),
  count: HEATMAP_AGGS.map((a) => ({ id: a.id, label: a.label })),
};

const Dashboard = async ({ searchParams }: Props) => {
  const { params, today, window } = await readAnalyticsRequest(searchParams);
  const heat = parseHeatmapParams(params);
  const map = clampWindow(window, HEATMAP_RETENTION_DAYS);
  if (sourceMode("posthog") === "off") return <SourceNotice source="posthog" />;
  return (
    <>
      <RangeBar
        pathname="/admin/analytics/heatmaps"
        params={params}
        window={window}
        today={today}
        note={`The page map covers the last ${HEATMAP_RETENTION_DAYS} days at most; the two grids below cover the whole range`}
      />
      <div className="space-y-6">
        <SourceNotice source="posthog" />
        <HeatmapControls
          options={OPTIONS}
          value={{
            page: heat.page.id,
            device: heat.device.id,
            map: heat.map.id,
            count: heat.agg,
          }}
          defaults={HEATMAP_DEFAULTS}
        />
        <Suspense
          key={`${heat.page.id}:${heat.device.id}:${heat.map.id}:${heat.agg}:${windowKey(map.window)}`}
          fallback={
            <AdminSkeleton
              label="Drawing the heatmap…"
              header={false}
              body="heatmap"
            />
          }
        >
          <HeatmapSection
            params={heat}
            window={map.window}
            clamped={map.clamped}
          />
        </Suspense>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Suspense
            key={`activity:${heat.agg}:${windowKey(window)}`}
            fallback={
              <AdminSkeleton label="Loading…" header={false} body="card" />
            }
          >
            <ActivitySection window={window} agg={heat.agg} />
          </Suspense>
          <Suspense
            key={`calendar:${heat.agg}:${windowKey(window)}`}
            fallback={
              <AdminSkeleton label="Loading…" header={false} body="card" />
            }
          >
            <CalendarSection window={window} agg={heat.agg} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

const AnalyticsHeatmapsPage = ({ searchParams }: Props) => (
  <Suspense fallback={<AdminSkeleton label="Loading analytics…" />}>
    <Dashboard searchParams={searchParams} />
  </Suspense>
);

export default AnalyticsHeatmapsPage;
