"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useT } from "@/lib/i18n";
import type { CalcChart as Chart } from "@/lib/calculators/types";
import { cn } from "@/lib/utils";

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

const Gauge = ({
  value,
  min,
  max,
  color,
  className = "h-32 w-32",
}: {
  value: number;
  min: number;
  max: number;
  color: string;
  className?: string;
}) => {
  const R = 52;
  const C = 2 * Math.PI * R;
  const ARC = 0.75;
  const frac = clamp((value - min) / (max - min || 1), 0, 1);
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <circle
        cx="60"
        cy="60"
        r={R}
        fill="none"
        stroke="rgb(var(--ink-700))"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${ARC * C} ${C}`}
        transform="rotate(135 60 60)"
      />
      <circle
        cx="60"
        cy="60"
        r={R}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${ARC * C * frac} ${C}`}
        transform="rotate(135 60 60)"
        className="chart-anim"
      />
    </svg>
  );
};

/** Full-circle radial fill (value / goal) with a centered readout. */
const Ring = ({
  frac,
  color,
  value,
  unit,
  className = "h-32 w-32",
  valueClass = "text-2xl",
}: {
  frac: number;
  color: string;
  value: string;
  unit?: string;
  className?: string;
  valueClass?: string;
}) => {
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative">
      <svg viewBox="0 0 120 120" className={cn("-rotate-90", className)}>
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="rgb(var(--ink-700))"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${clamp(frac, 0, 1) * C} ${C}`}
          className="chart-anim"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center font-mono font-bold text-ink-50 tabular-nums">
        <span className={valueClass}>
          <AnimatedNumber value={value} />
        </span>
        {unit && <span className="text-xs text-ink-400">{unit}</span>}
      </span>
    </div>
  );
};

/** Standard Olympic kg plate colours, with a neutral fallback. */
const PLATE_COLORS: Record<number, string> = {
  25: "#ef4444",
  20: "#3b82f6",
  15: "#eab308",
  10: "#22c55e",
  5: "#e5e7eb",
  2.5: "#f97316",
  1.25: "#a1a1aa",
};
/** lb racks: 45 red, 35 blue, 25 yellow, 10 green, 5 white, 2.5 orange. */
const PLATE_COLORS_LB: Record<number, string> = {
  45: "#ef4444",
  35: "#3b82f6",
  25: "#eab308",
  10: "#22c55e",
  5: "#e5e7eb",
  2.5: "#f97316",
};
const plateColor = (p: number, unit: "kg" | "lb") =>
  (unit === "lb" ? PLATE_COLORS_LB : PLATE_COLORS)[p] ?? "#a1a1aa";
const plateHeight = (p: number, unit: "kg" | "lb") => {
  const max = unit === "lb" ? 45 : 25;
  return 22 + (Math.min(p, max) / max) * 42;
};

export const CalcChart = ({
  chart,
  size = "md",
}: {
  chart: Chart;
  size?: "sm" | "md" | "lg";
}) => {
  const t = useT();

  if (chart.kind === "bars") {
    const labelW = size === "sm" ? "w-12" : "w-20";
    const valueW = size === "sm" ? "w-12" : "w-20";
    return (
      <div className="w-full space-y-2.5">
        {chart.bars.map((b, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "min-w-0 shrink-0 truncate text-xs text-ink-300",
                labelW,
              )}
            >
              {b.labelKey ? t(b.labelKey) : b.label}
            </span>
            <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-ink-700">
              <div
                className="chart-anim h-full rounded-full"
                style={{
                  width: `${clamp((b.value / (chart.max || 1)) * 100, 0, 100)}%`,
                  background: b.color,
                  opacity: b.highlight ? 1 : 0.5,
                }}
              />
            </div>
            <span
              className={cn(
                "shrink-0 truncate text-right font-mono text-xs text-ink-100 tabular-nums",
                valueW,
              )}
            >
              <AnimatedNumber value={b.display} />
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (chart.kind === "ring") {
    return (
      <div className="flex justify-center">
        <Ring
          frac={chart.value / (chart.goal || 1)}
          color={chart.color}
          value={chart.centerValue}
          unit={chart.centerUnit}
          className={
            size === "lg"
              ? "h-44 w-44 max-w-full"
              : size === "sm"
                ? "h-24 w-24 max-w-full"
                : "h-32 w-32 max-w-full"
          }
          valueClass={
            size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : "text-2xl"
          }
        />
      </div>
    );
  }

  if (chart.kind === "barbell") {
    // One side's stack, heaviest against the collar; the bar is drawn whole,
    // so the reader sees what they will load: the same plates on each side.
    const unit = chart.unit ?? "kg";
    const stack = chart.plates.flatMap((p) =>
      Array.from({ length: p.count }, () => p.plate),
    );
    const plate = (p: number, i: number) => (
      <span
        key={i}
        title={`${p} ${unit}`}
        className="chart-anim shrink-0 rounded-[2px] ring-1 ring-black/15"
        style={{
          height: `${plateHeight(p, unit)}px`,
          width: "9px",
          background: plateColor(p, unit),
        }}
      />
    );
    return (
      <div className="w-full overflow-hidden rounded-xl border border-ink-700 bg-ink-900/40 px-3 py-4">
        <div className="flex items-center justify-center gap-[3px]">
          <span className="h-1.5 w-5 shrink-0 rounded-l-sm bg-ink-500" />
          {[...stack].reverse().map(plate)}
          <span className="h-2.5 w-2 shrink-0 bg-ink-500" />
          <span className="h-1.5 min-w-10 flex-1 bg-ink-600" />
          <span className="h-2.5 w-2 shrink-0 bg-ink-500" />
          {stack.map(plate)}
          <span className="h-1.5 w-5 shrink-0 rounded-r-sm bg-ink-500" />
        </div>
        {stack.length > 0 && (
          <p className="mt-3 text-center font-mono text-[11px] tracking-wide text-ink-400 uppercase">
            {stack.map((p) => `${p}`).join(" · ")} {unit} ·{" "}
            {t("calc.perSideEach")}
          </p>
        )}
      </div>
    );
  }

  if (chart.kind === "split") {
    const total = chart.segments.reduce((s, x) => s + x.value, 0) || 1;
    return (
      <div className="mt-1 w-full">
        <div className="flex h-3.5 w-full gap-0.5 overflow-hidden rounded-full">
          {chart.segments.map((s) => (
            <div
              key={s.labelKey}
              className="chart-anim first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${(s.value / total) * 100}%`,
                background: s.color,
              }}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {chart.segments.map((s) => (
            <span
              key={s.labelKey}
              className="flex items-center gap-1.5 text-xs text-ink-300"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
              />
              {t(s.labelKey)} · {Math.round((s.value / total) * 100)}%
            </span>
          ))}
        </div>
      </div>
    );
  }

  const { value, min, max, segments } = chart;
  const activeIndex = segments.findIndex((s) => value < s.upto);
  const active =
    segments[activeIndex === -1 ? segments.length - 1 : activeIndex];
  const activeFrom = activeIndex <= 0 ? min : segments[activeIndex - 1].upto;
  const activeTo = activeIndex === -1 ? max : active.upto;
  const markerPct = clamp(((value - min) / (max - min || 1)) * 100, 0, 100);
  const gaugeClass =
    size === "lg"
      ? "h-44 w-44 max-w-full"
      : size === "sm"
        ? "h-24 w-24 max-w-full"
        : "h-32 w-32 max-w-full";
  const valueClass =
    size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-2xl";

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative">
        <Gauge
          value={value}
          min={min}
          max={max}
          color={active.color}
          className={gaugeClass}
        />
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-mono font-bold text-ink-50 tabular-nums",
            valueClass,
          )}
        >
          <AnimatedNumber value={String(value)} />
        </span>
      </div>
      <span
        className={cn(
          "mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold transition-colors duration-300",
          size === "lg" ? "text-base" : "text-sm",
        )}
        style={{
          color: active.color,
          borderColor: `${active.color}55`,
          background: `${active.color}14`,
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: active.color }}
        />
        {t(active.labelKey)}
        <span className="font-mono text-xs font-medium text-ink-300 tabular-nums">
          {activeFrom}
          {"–"}
          {activeTo}
        </span>
      </span>

      <div className="mt-3 w-full">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full">
          <div className="flex h-full w-full">
            {segments.map((s, i) => {
              const prev = i === 0 ? min : segments[i - 1].upto;
              return (
                <div
                  key={s.labelKey}
                  className="transition-opacity duration-300"
                  style={{
                    width: `${((s.upto - prev) / (max - min || 1)) * 100}%`,
                    background: s.color,
                    opacity: s === active ? 1 : 0.35,
                  }}
                />
              );
            })}
          </div>
          <span
            className="chart-anim absolute -top-1 h-4 w-1 -translate-x-1/2 rounded-full bg-ink-50 shadow-[0_0_0_2px_rgb(var(--ink-900))]"
            style={{ left: `${markerPct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};
