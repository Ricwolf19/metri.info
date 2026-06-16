"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CalcChart } from "@/components/calculators/CalcChart";
import { SaveCalcButton } from "@/components/calculators/SaveCalcButton";
import { ShareDialog } from "@/components/calculators/ShareDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n, useT } from "@/lib/i18n";
import { CALCULATORS } from "@/lib/calculators/registry";
import { buildSearch, decodeValues, readValues } from "@/lib/calculators/share";
import type { CalcConfig, CalcId, CalcValues } from "@/lib/calculators/types";
import { cn } from "@/lib/utils";

type Units = "metric" | "imperial";
const KG_TO_LB = 2.2046226218;
const CM_TO_IN = 1 / 2.54;
const r1 = (n: number) => Math.round(n * 10) / 10;
const convertible = (unit?: string) => unit === "kg" || unit === "cm";
const numeric = (s: string) => Number(s.replace(/[^0-9.-]/g, ""));

const roundToStep = (value: number, step: number) => {
  const decimals = (String(step).split(".")[1] ?? "").length;
  return Number(value.toFixed(decimals));
};

const StepButton = ({
  label,
  symbol,
  disabled,
  onClick,
}: {
  label: string;
  symbol: "+" | "−";
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink-600 bg-ink-800 font-mono text-lg text-ink-100 transition-colors",
      "hover:bg-ink-700",
      "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink-800",
    )}
  >
    {symbol}
  </button>
);

const FieldInputs = ({
  config,
  values,
  units,
  onChange,
}: {
  config: CalcConfig;
  values: CalcValues;
  units: Units;
  onChange: (name: string, metricValue: number | string) => void;
}) => {
  const t = useT();
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

  return (
    <div className="space-y-5">
      {config.fields.map((f) => {
        if (f.kind === "select") {
          return (
            <div key={f.name} className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-200">
                {t(f.labelKey)}
              </span>
              <Select
                value={String(values[f.name] ?? "")}
                onValueChange={(v) => onChange(f.name, v)}
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
        const step = dispStep ?? 1;
        const label = t(f.labelKey);
        const nudge = (dir: 1 | -1) => {
          let next = roundToStep(dispVal + dir * step, step);
          if (dispMin !== undefined) next = Math.max(dispMin, next);
          if (dispMax !== undefined) next = Math.min(dispMax, next);
          onChange(f.name, toMetric(next, f.unit));
        };
        const atMin = dispMin !== undefined && dispVal <= dispMin;
        const atMax = dispMax !== undefined && dispVal >= dispMax;

        return (
          <div key={f.name}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-sm font-medium text-ink-200">{label}</span>
              <span className="font-mono text-sm text-ink-50">
                {dispVal}
                {displayUnit(f.unit) && (
                  <span className="ml-0.5 text-xs text-ink-400">
                    {displayUnit(f.unit)}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StepButton
                symbol="−"
                label={t("calc.decrease", { field: label })}
                disabled={atMin}
                onClick={() => nudge(-1)}
              />
              <Input
                type="number"
                inputMode="decimal"
                value={String(dispVal)}
                min={dispMin}
                max={dispMax}
                step={dispStep}
                onChange={(e) =>
                  onChange(f.name, toMetric(Number(e.target.value), f.unit))
                }
                className="text-center font-mono"
              />
              <StepButton
                symbol="+"
                label={t("calc.increase", { field: label })}
                disabled={atMax}
                onClick={() => nudge(1)}
              />
            </div>
            {hasRange && (
              <input
                type="range"
                min={dispMin}
                max={dispMax}
                step={dispStep}
                value={dispVal}
                onChange={(e) =>
                  onChange(f.name, toMetric(Number(e.target.value), f.unit))
                }
                aria-label={t(f.labelKey)}
                className="mt-2 w-full accent-ink-100"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const ResultPanel = ({
  config,
  values,
  compact = false,
}: {
  config: CalcConfig;
  values: CalcValues;
  compact?: boolean;
}) => {
  const t = useT();
  const result = useMemo(() => config.compute(values), [config, values]);

  if (!result) {
    return (
      <div
        className={cn(
          "flex min-h-44 flex-col rounded-xl border border-ink-600 bg-ink-850 p-5",
          !compact && "h-full",
        )}
      >
        <p className="m-auto text-sm text-ink-400">{t("common.loading")}</p>
      </div>
    );
  }

  const chart = result.chart;
  const chartSize = compact ? "sm" : "lg";

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-ink-600 bg-ink-850",
        compact ? "p-4" : "h-full p-5",
      )}
    >
      <div className="flex flex-col items-center text-center">
        <p className="text-sm text-ink-400">{t(result.primaryLabelKey)}</p>
        <p
          className={cn(
            "mt-1 font-mono font-bold text-accent",
            compact ? "text-3xl" : "text-4xl",
          )}
        >
          {result.primaryValue}
          {result.primaryUnit && (
            <span className="ml-1 text-lg text-ink-300">
              {result.primaryUnit}
            </span>
          )}
        </p>
        {result.noteKey && (
          <span className="mt-2.5 inline-flex w-fit items-center rounded-md border border-ink-500 bg-ink-700 px-2.5 py-1 text-xs font-semibold text-accent">
            {t(result.noteKey)}
          </span>
        )}
      </div>

      {chart && (
        <div
          className={cn(
            "flex items-center justify-center",
            compact ? "mt-4" : "mt-6 flex-1",
          )}
        >
          <div className="w-full">
            <CalcChart chart={chart} size={chartSize} />
          </div>
        </div>
      )}

      {result.rows && result.rows.length > 0 && (
        <ul
          className={cn(
            "space-y-1.5 border-t border-ink-700 pt-4",
            chart ? "mt-4" : "mt-auto pt-4",
          )}
        >
          {result.rows.map((row, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-ink-300">
                {row.labelKey ? t(row.labelKey) : row.label}
              </span>
              <span className="font-mono text-ink-100">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const DeltaBar = ({
  config,
  a,
  b,
}: {
  config: CalcConfig;
  a: CalcValues;
  b: CalcValues;
}) => {
  const t = useT();
  const ra = config.compute(a);
  const rb = config.compute(b);
  if (!ra || !rb) return null;
  const delta = numeric(rb.primaryValue) - numeric(ra.primaryValue);
  const unit = ra.primaryUnit ? ` ${ra.primaryUnit}` : "";
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-ink-600 bg-ink-850 px-4 py-4 sm:px-5">
      <span className="text-sm font-medium text-ink-300">
        {t("calc.difference")} (B − A)
      </span>
      <span
        className={cn(
          "font-mono text-lg font-bold",
          delta === 0 ? "text-ink-300" : "text-accent",
        )}
      >
        {delta > 0 ? "+" : ""}
        {delta.toLocaleString("en-US")}
        {unit}
      </span>
    </div>
  );
};

const ScenarioBadge = ({ tag }: { tag: "A" | "B" }) => {
  const t = useT();
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-ink-600 bg-ink-900 text-xs font-bold text-accent">
        {tag}
      </span>
      <span className="text-sm font-medium text-ink-300">
        {tag === "A" ? t("calc.scenarioA") : t("calc.scenarioB")}
      </span>
    </div>
  );
};

export const Calculator = ({ id }: { id: CalcId }) => {
  const config = CALCULATORS[id];
  const { t, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasUnits = config.fields.some(
    (f) => f.kind === "number" && convertible(f.unit),
  );

  const [units, setUnits] = useState<Units>(() => {
    try {
      return localStorage.getItem("metri_units") === "imperial"
        ? "imperial"
        : "metric";
    } catch {
      return "metric";
    }
  });
  const setUnitsPersist = (u: Units) => {
    setUnits(u);
    try {
      localStorage.setItem("metri_units", u);
    } catch {}
  };

  const [a, setA] = useState<CalcValues>(() =>
    readValues(config, (k) => searchParams.get(k)),
  );
  const [compare, setCompare] = useState(
    () => searchParams.get("compare") === "1",
  );
  const [b, setB] = useState<CalcValues>(() => {
    const packed = searchParams.get("b");
    return packed
      ? decodeValues(config, packed)
      : readValues(config, (k) => searchParams.get(k));
  });

  const search = buildSearch(config, a, b, compare);

  const lastTracked = useRef<string | null>(null);
  useEffect(() => {
    if (!config.compute(a)) return;
    if (lastTracked.current === id) return;
    const timer = setTimeout(() => {
      if (!posthog.__loaded) return;
      lastTracked.current = id;
      posthog.capture("calculator_used", { calculator: id });
    }, 1500);
    return () => clearTimeout(timer);
  }, [config, id, a]);

  const commit = useCallback(
    (nextA: CalcValues, nextB: CalcValues, nextCompare: boolean) => {
      const qs = buildSearch(config, nextA, nextB, nextCompare);
      router.replace(`${pathname}?${qs}`, { scroll: false });
    },
    [config, pathname, router],
  );

  const updateA = (name: string, val: number | string) => {
    const next = { ...a, [name]: val };
    setA(next);
    commit(next, b, compare);
  };
  const updateB = (name: string, val: number | string) => {
    const next = { ...b, [name]: val };
    setB(next);
    commit(a, next, compare);
  };
  const toggleCompare = () => {
    const next = !compare;
    const nextB = next ? { ...a } : b;
    setCompare(next);
    setB(nextB);
    commit(a, nextB, next);
  };

  return (
    <div className="rounded-card border border-ink-600 bg-ink-800 p-4 sm:p-6">
      {hasUnits && (
        <div className="mb-6 inline-flex rounded-lg border border-ink-600 bg-ink-900 p-0.5 text-xs font-medium">
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

      {compare ? (
        <div className="space-y-6">
          <div className="grid gap-x-6 gap-y-8 md:grid-cols-2">
            <div className="space-y-4">
              <ScenarioBadge tag="A" />
              <FieldInputs
                config={config}
                values={a}
                units={units}
                onChange={updateA}
              />
              <ResultPanel config={config} values={a} compact />
            </div>
            <div className="space-y-4">
              <ScenarioBadge tag="B" />
              <FieldInputs
                config={config}
                values={b}
                units={units}
                onChange={updateB}
              />
              <ResultPanel config={config} values={b} compact />
            </div>
          </div>
          <DeltaBar config={config} a={a} b={b} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <FieldInputs
            config={config}
            values={a}
            units={units}
            onChange={updateA}
          />
          <ResultPanel config={config} values={a} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ink-700 pt-5">
        <ShareDialog calcId={id} locale={locale} search={search} />
        <SaveCalcButton id={id} values={a} />
        <button
          type="button"
          onClick={toggleCompare}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            compare
              ? "border-ink-500 text-accent"
              : "border-ink-600 text-ink-300 hover:bg-ink-700 hover:text-ink-50",
          )}
        >
          {compare ? t("calc.compareExit") : t("calc.compare")}
        </button>
      </div>
    </div>
  );
};
