"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { CalcChart } from "@/components/calculators/CalcChart";
import { ShareDialog } from "@/components/calculators/ShareDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";
import { CALCULATORS } from "@/lib/calculators/registry";
import type { CalcId, CalcValues } from "@/lib/calculators/types";
import { cn } from "@/lib/utils";

type Units = "metric" | "imperial";
const KG_TO_LB = 2.2046226218;
const CM_TO_IN = 1 / 2.54;
const r1 = (n: number) => Math.round(n * 10) / 10;
const convertible = (unit?: string) => unit === "kg" || unit === "cm";

export const Calculator = ({ id }: { id: CalcId }) => {
  const config = CALCULATORS[id];
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Values are always stored in METRIC (so compute + shareable URLs are stable).
  const initial = useMemo<CalcValues>(() => {
    const v: CalcValues = {};
    for (const f of config.fields) {
      const fromUrl = searchParams.get(f.name);
      if (f.kind === "number") {
        v[f.name] = fromUrl !== null ? Number(fromUrl) : f.default;
      } else {
        v[f.name] =
          fromUrl !== null && f.options.some((o) => o.value === fromUrl)
            ? fromUrl
            : f.default;
      }
    }
    return v;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [values, setValues] = useState<CalcValues>(initial);
  const [units, setUnits] = useState<Units>(() => {
    try {
      return localStorage.getItem("metri_units") === "imperial"
        ? "imperial"
        : "metric";
    } catch {
      return "metric";
    }
  });

  const hasUnits = config.fields.some(
    (f) => f.kind === "number" && convertible(f.unit),
  );

  const setUnitsPersist = (u: Units) => {
    setUnits(u);
    try {
      localStorage.setItem("metri_units", u);
    } catch {}
  };

  // metric ↔ display conversions (display = what the user sees/edits)
  const toDisplay = (m: number, unit?: string) =>
    units === "imperial" && convertible(unit)
      ? r1(m * (unit === "kg" ? KG_TO_LB : CM_TO_IN))
      : m;
  const toMetric = (d: number, unit?: string) =>
    units === "imperial" && convertible(unit)
      ? d / (unit === "kg" ? KG_TO_LB : CM_TO_IN)
      : d;
  const displayUnit = (unit?: string) =>
    units === "imperial" && convertible(unit)
      ? unit === "kg"
        ? "lb"
        : "in"
      : unit;

  const update = useCallback(
    (name: string, metricValue: number | string) => {
      const next = { ...values, [name]: metricValue };
      setValues(next);
      const params = new URLSearchParams();
      for (const f of config.fields) params.set(f.name, String(next[f.name]));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [values, config.fields, router, pathname],
  );

  const result = useMemo(() => config.compute(values), [config, values]);

  return (
    <div className="grid gap-6 rounded-card border border-ink-600 bg-ink-800 p-6 md:grid-cols-2">
      <div className="space-y-5">
        {hasUnits && (
          <div className="inline-flex rounded-lg border border-ink-600 bg-ink-900 p-0.5 text-xs font-medium">
            {(["metric", "imperial"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnitsPersist(u)}
                className={cn(
                  "rounded-md px-3 py-1.5 transition-colors",
                  units === u
                    ? "bg-ink-700 text-ink-50"
                    : "text-ink-400 hover:text-ink-100",
                )}
              >
                {t(u === "metric" ? "calc.metric" : "calc.imperial")}
              </button>
            ))}
          </div>
        )}

        {config.fields.map((f) => {
          if (f.kind === "select") {
            return (
              <div key={f.name} className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-200">
                  {t(f.labelKey)}
                </span>
                <Select
                  value={String(values[f.name] ?? "")}
                  onValueChange={(v) => update(f.name, v)}
                >
                  <SelectTrigger aria-label={t(f.labelKey)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {t(o.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }

          const dispVal = toDisplay(Number(values[f.name]), f.unit);
          const dispMin =
            f.min !== undefined ? toDisplay(f.min, f.unit) : undefined;
          const dispMax =
            f.max !== undefined ? toDisplay(f.max, f.unit) : undefined;
          const dispStep =
            units === "imperial" && convertible(f.unit)
              ? f.unit === "kg"
                ? 1
                : 0.5
              : f.step;
          const hasRange = dispMin !== undefined && dispMax !== undefined;

          return (
            <div key={f.name}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink-200">
                  {t(f.labelKey)}
                </span>
                <span className="font-mono text-sm text-ink-50">
                  {dispVal}
                  {displayUnit(f.unit) && (
                    <span className="ml-0.5 text-xs text-ink-400">
                      {displayUnit(f.unit)}
                    </span>
                  )}
                </span>
              </div>
              <Input
                type="number"
                inputMode="decimal"
                value={String(dispVal)}
                min={dispMin}
                max={dispMax}
                step={dispStep}
                onChange={(e) =>
                  update(f.name, toMetric(Number(e.target.value), f.unit))
                }
                className="font-mono"
              />
              {hasRange && (
                <input
                  type="range"
                  min={dispMin}
                  max={dispMax}
                  step={dispStep}
                  value={dispVal}
                  onChange={(e) =>
                    update(f.name, toMetric(Number(e.target.value), f.unit))
                  }
                  aria-label={t(f.labelKey)}
                  className="mt-2 w-full accent-ink-100"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col rounded-xl border border-ink-600 bg-ink-850 p-5">
        {result ? (
          <>
            <p className="text-sm text-ink-400">{t(result.primaryLabelKey)}</p>
            <p className="mt-1 font-mono text-4xl font-bold text-accent">
              {result.primaryValue}
              {result.primaryUnit && (
                <span className="ml-1 text-lg text-ink-300">
                  {result.primaryUnit}
                </span>
              )}
            </p>
            {result.noteKey && (
              <span className="mt-3 inline-flex w-fit items-center rounded-md border border-ink-600 bg-ink-700 px-2 py-0.5 text-xs font-medium text-accent">
                {t(result.noteKey)}
              </span>
            )}
            {result.chart && (
              <div className="mt-5">
                <CalcChart chart={result.chart} />
              </div>
            )}
            {result.rows && result.rows.length > 0 && (
              <ul className="mt-4 space-y-1.5 border-t border-ink-700 pt-4">
                {result.rows.map((row, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink-300">
                      {row.labelKey ? t(row.labelKey) : row.label}
                    </span>
                    <span className="font-mono text-ink-100">{row.value}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 border-t border-ink-700 pt-5">
              <ShareDialog />
            </div>
          </>
        ) : (
          <p className="m-auto text-sm text-ink-400">{t("common.loading")}</p>
        )}
      </div>
    </div>
  );
};
