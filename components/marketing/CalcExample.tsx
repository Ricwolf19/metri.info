"use client";

import { CalcChart } from "@/components/calculators/CalcChart";
import type { CalcChart as Chart } from "@/lib/calculators/types";
import { cn } from "@/lib/utils";

/** On-brand sample palette (mirrors the calculators' chart colours). */
const C = {
  violet: "#8b5cf6",
  amber: "#f59e0b",
  blue: "#3b82f6",
  lime: "#bef82b",
};

/** A TDEE-style banded bar chart (plain labels — no i18n keys needed). */
export const SAMPLE_TDEE: Chart = {
  kind: "bars",
  max: 3059,
  bars: [
    { label: "BMR", value: 1780, display: "1,780", color: C.violet },
    { label: "Cut", value: 2259, display: "2,259", color: C.amber },
    {
      label: "Maintain",
      value: 2759,
      display: "2,759",
      color: C.lime,
      highlight: true,
    },
    { label: "Bulk", value: 3059, display: "3,059", color: C.blue },
  ],
};

/** A macro-split chart (uses real result keys so the legend localizes). */
export const SAMPLE_MACROS: Chart = {
  kind: "split",
  segments: [
    { labelKey: "calc.result.protein", value: 180 * 4, color: C.lime },
    { labelKey: "calc.result.carbs", value: 250 * 4, color: C.blue },
    { labelKey: "calc.result.fat", value: 70 * 9, color: C.amber },
  ],
};

/**
 * A live, on-brand mock of a calculator result — the real `CalcChart` rendered
 * with sample data. Used to make the marketing sections visual ("show, don't
 * tell") instead of walls of text.
 */
export const CalcExample = ({
  label,
  value,
  unit,
  chart,
  caption,
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  chart: Chart;
  caption?: string;
  className?: string;
}) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-card border border-brand/20 bg-ink-850 p-5 shadow-2xl sm:p-6",
      className,
    )}
  >
    <div
      aria-hidden
      className="glow-brand pointer-events-none absolute inset-x-0 top-0 h-24"
    />
    <div className="relative">
      <p className="font-mono text-xs tracking-widest text-ink-400 uppercase">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-4xl font-bold text-brand">
        {value}
        {unit && <span className="ml-1 text-base text-ink-300">{unit}</span>}
      </p>
      <div className="mt-5">
        <CalcChart chart={chart} size="lg" />
      </div>
      {caption && (
        <p className="mt-4 border-t border-ink-700 pt-3 text-xs leading-relaxed text-ink-400">
          {caption}
        </p>
      )}
    </div>
  </div>
);
