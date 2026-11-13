"use client";

import { useState } from "react";

import { AreaLine, type AreaPoint } from "@/components/admin/charts/AreaLine";
import { Segmented } from "@/components/ui/segmented";
import { formatMetric, type MetricFormat } from "@/lib/analytics/format";
import { dayLabel } from "@/lib/analytics/range";

export type TrendView = {
  id: string;
  label: string;
  points: AreaPoint[];
  color?: string;
  format?: MetricFormat;
  /** `sum` for counts, `mean` for rates and positions. */
  aggregate?: "sum" | "mean";
  /** Search position: lower is better, and the caption says so. */
  lowerIsBetter?: boolean;
};

/**
 * A daily series with one tab per view (visitors / pageviews, clicks / CTR…),
 * captioned with the window's first and last day, its total or mean and its
 * peak day. One tab renders no switcher.
 */
export const TrendTabs = ({ views }: { views: TrendView[] }) => {
  const [active, setActive] = useState(views[0]?.id ?? "");
  const view = views.find((v) => v.id === active) ?? views[0];
  if (!view) return null;
  const values = view.points.map((p) => p.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const shown = values.filter((v) => v > 0);
  const summary =
    view.aggregate === "mean"
      ? shown.length > 0
        ? shown.reduce((a, b) => a + b, 0) / shown.length
        : 0
      : sum;
  const peak = view.points.reduce<AreaPoint | null>(
    (best, p) => (best === null || p.value > best.value ? p : best),
    null,
  );

  return (
    <div className="space-y-3">
      {views.length > 1 ? (
        <Segmented
          size="sm"
          aria-label="Series"
          value={view.id}
          onValueChange={setActive}
          options={views.map((v) => ({ value: v.id, label: v.label }))}
          className="max-w-md"
        />
      ) : null}
      <p className="font-mono text-2xl font-bold text-ink-50">
        {formatMetric(summary, view.format)}
        <span className="ml-2 text-xs font-normal text-ink-400">
          {view.aggregate === "mean" ? "average" : "total"}
          {view.lowerIsBetter ? " · lower is better" : ""}
        </span>
      </p>
      <AreaLine points={view.points} color={view.color} title={view.label} />
      <div className="flex justify-between gap-2 font-mono text-[11px] text-ink-500">
        <span>{view.points[0] ? dayLabel(view.points[0].date) : ""}</span>
        {peak && peak.value > 0 && !view.lowerIsBetter ? (
          <span>
            Peak {formatMetric(peak.value, view.format)} on{" "}
            {dayLabel(peak.date)}
          </span>
        ) : null}
        <span>
          {view.points.at(-1) ? dayLabel(view.points.at(-1)!.date) : ""}
        </span>
      </div>
    </div>
  );
};
