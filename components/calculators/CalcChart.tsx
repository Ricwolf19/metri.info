"use client";

import { useT } from "@/lib/i18n";
import type { CalcChart as Chart } from "@/lib/calculators/types";

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

const Gauge = ({
  value,
  min,
  max,
  color,
}: {
  value: number;
  min: number;
  max: number;
  color: string;
}) => {
  const R = 52;
  const C = 2 * Math.PI * R;
  const ARC = 0.75; // 270°
  const frac = clamp((value - min) / (max - min || 1), 0, 1);
  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32">
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
}: {
  frac: number;
  color: string;
  value: string;
  unit?: string;
}) => {
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
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
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center font-mono font-bold text-ink-50">
        <span className="text-2xl">{value}</span>
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
const plateColor = (p: number) => PLATE_COLORS[p] ?? "#a1a1aa";
const plateHeight = (p: number) => 22 + (Math.min(p, 25) / 25) * 42;

export const CalcChart = ({ chart }: { chart: Chart }) => {
  const t = useT();

  if (chart.kind === "bars") {
    return (
      <div className="space-y-2.5">
        {chart.bars.map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-20 shrink-0 truncate text-xs text-ink-300">
              {b.labelKey ? t(b.labelKey) : b.label}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${clamp((b.value / (chart.max || 1)) * 100, 0, 100)}%`,
                  background: b.color,
                  opacity: b.highlight ? 1 : 0.5,
                }}
              />
            </div>
            <span className="w-20 shrink-0 text-right font-mono text-xs text-ink-100">
              {b.display}
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
        />
      </div>
    );
  }

  if (chart.kind === "barbell") {
    const stack = chart.plates.flatMap((p) =>
      Array.from({ length: p.count }, () => p.plate),
    );
    return (
      <div className="flex items-center justify-center gap-[3px] rounded-xl border border-ink-700 bg-ink-900/40 py-4">
        <span className="h-1.5 w-9 rounded-l-sm bg-ink-500" />
        {stack.length === 0 ? (
          <span className="h-1.5 w-16 bg-ink-600" />
        ) : (
          stack.map((p, i) => (
            <span
              key={i}
              title={`${p} kg`}
              className="rounded-[2px] ring-1 ring-black/15"
              style={{
                height: `${plateHeight(p)}px`,
                width: "9px",
                background: plateColor(p),
              }}
            />
          ))
        )}
        <span className="h-2.5 w-2 rounded-r-sm bg-ink-500" />
      </div>
    );
  }

  if (chart.kind === "split") {
    const total = chart.segments.reduce((s, x) => s + x.value, 0) || 1;
    return (
      <div className="mt-1">
        <div className="flex h-3 overflow-hidden rounded-full">
          {chart.segments.map((s) => (
            <div
              key={s.labelKey}
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

  // scale
  const { value, min, max, segments } = chart;
  const active =
    segments.find((s) => value < s.upto) ?? segments[segments.length - 1];
  const markerPct = clamp(((value - min) / (max - min || 1)) * 100, 0, 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Gauge value={value} min={min} max={max} color={active.color} />
        <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold text-ink-50">
          {value}
        </span>
      </div>
      <span
        className="mt-1 rounded-md px-2 py-0.5 text-xs font-medium"
        style={{ color: active.color }}
      >
        {t(active.labelKey)}
      </span>

      {/* Banded spectrum */}
      <div className="mt-3 w-full">
        <div className="relative h-2 w-full overflow-hidden rounded-full">
          <div className="flex h-full w-full">
            {segments.map((s, i) => {
              const prev = i === 0 ? min : segments[i - 1].upto;
              return (
                <div
                  key={s.labelKey}
                  style={{
                    width: `${((s.upto - prev) / (max - min || 1)) * 100}%`,
                    background: s.color,
                  }}
                />
              );
            })}
          </div>
          <span
            className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 bg-ink-50"
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
