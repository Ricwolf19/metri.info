"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { CalcChart } from "@/components/calculators/CalcChart";
import { SaveCalcButton } from "@/components/calculators/SaveCalcButton";
import { ShareDialog } from "@/components/calculators/ShareDialog";
import { XIcon } from "@/components/icons";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { StableLabel } from "@/components/ui/StableLabel";
import { track } from "@/lib/analytics/track";
import { useI18n, useT } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { applyFactsToValues } from "@/lib/calculators/prefill";
import { getCalcFacts } from "@/lib/calculators/profile";
import { CALCULATORS } from "@/lib/calculators/registry";
import { buildSearch, decodeValues, readValues } from "@/lib/calculators/share";
import {
  type CalcConfig,
  type CalcId,
  type CalcResult,
  type CalcValues,
  fieldInUse,
} from "@/lib/calculators/types";
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
      "flex h-11 w-11 shrink-0 items-center justify-center rounded-field border border-ink-600 bg-ink-800 font-mono text-lg text-ink-100 transition-colors",
      "hover:bg-ink-700",
      "focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none",
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
  columns = false,
}: {
  config: CalcConfig;
  values: CalcValues;
  units: Units;
  onChange: (name: string, metricValue: number | string) => void;
  /** Lay fields out in a responsive 2-column grid (single-calculator view). */
  columns?: boolean;
}) => {
  const { t, locale } = useI18n();
  // Per instance: compare mode renders the same field names twice.
  const uid = useId();
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
    <div
      className={cn(
        columns ? "grid gap-x-6 gap-y-5 sm:grid-cols-2" : "space-y-5",
      )}
    >
      {config.fields.map((f) => {
        // A field the current formula ignores stays visible but disabled.
        const inUse = fieldInUse(f, values);
        const reason =
          !inUse && f.usedWhen?.reasonKey ? (
            <p className="mt-2 text-xs leading-relaxed text-ink-400">
              {t(f.usedWhen.reasonKey)}
            </p>
          ) : null;
        if (f.kind === "select") {
          return (
            <div key={f.name} className="block">
              <span
                className={cn(
                  "mb-1.5 block text-sm font-medium",
                  inUse ? "text-ink-200" : "text-ink-400",
                )}
              >
                {t(f.labelKey)}
              </span>
              <Select
                value={String(values[f.name] ?? "")}
                onValueChange={(v) => onChange(f.name, v)}
                disabled={!inUse}
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
              {reason}
            </div>
          );
        }

        const dispVal = toDisplay(Number(values[f.name]), f.unit);
        const dispMin =
          f.min !== undefined ? toDisplay(f.min, f.unit) : undefined;
        const dispMax =
          f.max !== undefined ? toDisplay(f.max, f.unit) : undefined;
        // Imperial keeps a decimal for body measures: a tape reads 33.5 in.
        const dispStep =
          units === "imperial" && convertible(f.unit)
            ? f.unit === "kg"
              ? 0.5
              : 0.1
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
        const unit = displayUnit(f.unit);
        // Out of range blanks the result; say why, next to the field. An
        // unused field can't blank it, so it never reads as an error.
        const invalid =
          inUse &&
          (!Number.isFinite(dispVal) ||
            (dispMin !== undefined && dispVal < dispMin) ||
            (dispMax !== undefined && dispVal > dispMax));
        const inputId = `${uid}-${f.name}`;
        const describedBy = [
          unit ? `${inputId}-unit` : null,
          invalid && hasRange ? `${inputId}-error` : null,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={f.name}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label
                htmlFor={inputId}
                className={cn(
                  "text-sm font-medium",
                  inUse ? "text-ink-200" : "text-ink-400",
                )}
              >
                {label}
              </label>
              <span
                className={cn(
                  "font-mono text-sm",
                  inUse ? "text-ink-50" : "text-ink-400",
                )}
              >
                {dispVal}
                {unit && (
                  <span
                    id={`${inputId}-unit`}
                    className="ml-0.5 text-xs text-ink-400"
                  >
                    {unit}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StepButton
                symbol="−"
                label={t("calc.decrease", { field: label })}
                disabled={atMin || !inUse}
                onClick={() => nudge(-1)}
              />
              <Input
                id={inputId}
                type="number"
                inputMode="decimal"
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                disabled={!inUse}
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
                disabled={atMax || !inUse}
                onClick={() => nudge(1)}
              />
            </div>
            {invalid && hasRange && (
              <p
                id={`${inputId}-error`}
                className="mt-1.5 text-xs text-red-400"
              >
                {t("calc.outOfRange", {
                  min: `${dispMin}${unit ? ` ${unit}` : ""}`,
                  max: `${dispMax}${unit ? ` ${unit}` : ""}`,
                })}
              </p>
            )}
            {hasRange && (
              <Slider
                min={dispMin}
                max={dispMax}
                step={step}
                value={[Number.isFinite(dispVal) ? dispVal : dispMin]}
                onValueChange={([v]) => onChange(f.name, toMetric(v, f.unit))}
                thumbLabel={label}
                valueText={unit ? `${dispVal} ${unit}` : undefined}
                disabled={!inUse}
                className="mt-1"
              />
            )}
            {f.presets && f.presets.length > 0 && (
              <div
                role="group"
                aria-label={t("calc.presets", { field: label })}
                className="mt-2 flex flex-wrap gap-2"
              >
                {f.presets.map((p) => {
                  const active = Number(values[f.name]) === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={active}
                      disabled={!inUse}
                      onClick={() => onChange(f.name, p)}
                      className={cn(
                        "h-9 rounded-full border px-3.5 font-mono text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                        "focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none",
                        active
                          ? "border-brand/40 bg-brand/10 font-semibold text-brand"
                          : "border-ink-600 bg-ink-800 text-ink-300 hover:bg-ink-700 hover:text-ink-100",
                      )}
                    >
                      {toDisplay(p, f.unit)}
                      {unit && <span className="sr-only"> {unit}</span>}
                    </button>
                  );
                })}
              </div>
            )}
            {reason}
            {f.hint && (
              <p className="mt-2 text-xs leading-relaxed text-ink-400">
                {t(f.hint.key)}
                {f.hint.route && (
                  <>
                    {" "}
                    <Link
                      href={routePath(f.hint.route.id, locale)}
                      className="font-medium text-brand underline underline-offset-2"
                    >
                      {t(f.hint.route.labelKey)}
                    </Link>
                  </>
                )}
                {f.hint.set &&
                  values[f.hint.set.field] !== f.hint.set.value && (
                    <>
                      {" "}
                      <button
                        type="button"
                        onClick={() =>
                          onChange(f.hint!.set!.field, f.hint!.set!.value)
                        }
                        className="font-medium text-brand underline underline-offset-2"
                      >
                        {t(f.hint.set.labelKey)}
                      </button>
                    </>
                  )}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ResultHeader = ({
  result,
  align,
}: {
  result: NonNullable<CalcResult>;
  align: "center" | "left";
}) => {
  const t = useT();
  return (
    <div
      className={cn(
        align === "center" ? "text-center" : "text-center md:text-left",
      )}
    >
      <p className="font-mono text-xs tracking-widest text-ink-400 uppercase">
        {t(result.primaryLabelKey)}
      </p>
      <p
        className={cn(
          "mt-1.5 font-mono font-bold text-brand tabular-nums",
          align === "center" ? "text-3xl" : "text-5xl",
        )}
      >
        <AnimatedNumber value={result.primaryValue} />
        {result.primaryUnit && (
          <span className="ml-1 text-lg text-ink-300">
            {result.primaryUnit}
          </span>
        )}
      </p>
      {result.noteKey && (
        <span
          className={cn(
            "mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand",
            align === "center" && "mx-auto",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          {t(result.noteKey)}
        </span>
      )}
    </div>
  );
};

/**
 * Disabled/empty shell for when the inputs don't produce a valid result.
 * Same DOM shape as the real panel (same border, padding, two-column grid,
 * rows grid) so toggling from "no result" → "result" doesn't cause layout
 * shift on big charts — the user's pointer position stays put while they
 * tweak the value, which is the whole point (the previous "Invalid value"
 * banner collapsed the panel and made the chart jump).
 */
const EmptyResultPanel = ({ compact = false }: { compact?: boolean }) => {
  if (compact) {
    return (
      <div
        aria-hidden="true"
        className="rounded-card border border-ink-700 bg-ink-850 p-4"
      >
        <div className="flex flex-col items-center gap-1.5">
          <span className="block h-2.5 w-14 rounded-full bg-ink-700/70" />
          <span className="block h-7 w-20 rounded-md bg-ink-700/70" />
        </div>
        <div className="mt-4 h-24 rounded-field bg-ink-700/30" />
        <ul className="mt-4 space-y-1.5 border-t border-ink-700 pt-4">
          <li className="h-3 w-3/4 rounded-full bg-ink-700/50" />
          <li className="h-3 w-1/2 rounded-full bg-ink-700/50" />
        </ul>
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-card border border-ink-700 bg-ink-850 p-5 sm:p-6"
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,15rem)_1fr] md:items-center">
        <div className="text-center md:text-left">
          <span className="block h-2.5 w-16 rounded-full bg-ink-700/70" />
          <span className="mt-1.5 block h-10 w-28 rounded-md bg-ink-700/70" />
        </div>
        <div className="h-32 min-w-0 rounded-field bg-ink-700/30" />
      </div>
      <ul className="mt-5 grid gap-2.5 border-t border-ink-700 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        <li className="h-12 rounded-field bg-ink-700/40" />
        <li className="h-12 rounded-field bg-ink-700/40" />
        <li className="h-12 rounded-field bg-ink-700/40" />
      </ul>
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
    return <EmptyResultPanel compact={compact} />;
  }

  const chart = result.chart;

  // Compact (compare A/B) — narrow, stacked vertically.
  if (compact) {
    return (
      <div className="flex flex-col rounded-card border border-ink-600 bg-ink-850 p-4">
        <ResultHeader result={result} align="center" />
        {chart && (
          <div className="mt-4 flex items-center justify-center">
            <div className="w-full">
              <CalcChart chart={chart} size="sm" />
            </div>
          </div>
        )}
        {result.rows && result.rows.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-ink-700 pt-4">
            {result.rows.map((row, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink-300">
                  {row.labelKey ? t(row.labelKey) : row.label}
                </span>
                <span className="font-mono text-ink-100 tabular-nums">
                  <AnimatedNumber value={row.value} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Single-calculator — wide horizontal band: value beside the chart, detail
  // rows in a horizontal grid below, using the full width.
  return (
    <div className="relative overflow-hidden rounded-card border border-brand/20 bg-ink-850 p-5 sm:p-6">
      <div
        aria-hidden
        className="glow-brand pointer-events-none absolute inset-x-0 top-0 h-28"
      />
      <div
        className={cn(
          "relative grid gap-6",
          chart && "md:grid-cols-[minmax(0,15rem)_1fr] md:items-center",
        )}
      >
        <ResultHeader result={result} align="left" />
        {chart && (
          <div className="min-w-0">
            <CalcChart chart={chart} size="lg" />
          </div>
        )}
      </div>

      {result.rows && result.rows.length > 0 && (
        <ul className="relative mt-5 grid gap-2.5 border-t border-ink-700 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.rows.map((row, i) => (
            <li
              key={i}
              className="rounded-field border border-ink-600/60 bg-ink-900/40 px-3 py-2"
            >
              <p className="truncate text-xs text-ink-400">
                {row.labelKey ? t(row.labelKey) : row.label}
              </p>
              <p className="mt-0.5 font-mono text-sm font-medium text-ink-100 tabular-nums">
                <AnimatedNumber value={row.value} />
              </p>
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
          "font-mono text-lg font-bold tabular-nums",
          delta === 0 ? "text-ink-300" : "text-brand",
        )}
      >
        {delta > 0 ? "+" : ""}
        <AnimatedNumber value={delta.toLocaleString("en-US")} />
        {unit}
      </span>
    </div>
  );
};

const ScenarioBadge = ({ tag, id }: { tag: "A" | "B"; id: string }) => {
  const t = useT();
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="flex h-6 w-6 items-center justify-center rounded-md border border-ink-600 bg-ink-900 text-xs font-bold text-accent"
      >
        {tag}
      </span>
      <span id={id} className="text-sm font-medium text-ink-300">
        {tag === "A" ? t("calc.scenarioA") : t("calc.scenarioB")}
      </span>
    </div>
  );
};

/** Debounce a value so the result/chart only recompute once input settles —
 * dragging a slider or typing fast no longer thrashes the UI. */
const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

/**
 * The result, spoken: one persistent polite region per panel, so a screen
 * reader hears the new number once the input settles (a slower debounce than
 * the panel's, or a slider drag would read every stop). It sits beside the
 * visual panel, never around the rolling digits.
 */
const ResultAnnouncer = ({
  config,
  values,
  prefix,
}: {
  config: CalcConfig;
  values: CalcValues;
  prefix?: string;
}) => {
  const t = useT();
  const result = useMemo(() => config.compute(values), [config, values]);
  const text = result
    ? [
        `${t(result.primaryLabelKey)}: ${result.primaryValue}${result.primaryUnit ? ` ${result.primaryUnit}` : ""}`,
        result.noteKey ? t(result.noteKey) : null,
      ]
        .filter(Boolean)
        .join(". ")
    : t("calc.noResult");
  const spoken = useDebouncedValue(prefix ? `${prefix}. ${text}` : text, 700);
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {spoken}
    </p>
  );
};

export const Calculator = ({ id }: { id: CalcId }) => {
  const config = CALCULATORS[id];
  const { t, locale } = useI18n();
  const scenarioId = useId();
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

  const [prefilled, setPrefilled] = useState(false);

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

  // Debounced copies drive the result panel + chart so they don't recompute on
  // every keystroke / slider tick (inputs themselves stay instant). The charts
  // and the rolling number tween between values, so a short settle time is
  // enough for the result to feel live without thrashing.
  const aDebounced = useDebouncedValue(a, 250);
  const bDebounced = useDebouncedValue(b, 250);

  const search = buildSearch(config, a, b, compare);
  const canSave = useMemo(() => config.compute(a) !== null, [config, a]);

  const lastTracked = useRef<string | null>(null);
  useEffect(() => {
    if (!config.compute(a)) return;
    if (lastTracked.current === id) return;
    const timer = setTimeout(() => {
      lastTracked.current = id;
      track("calculator_used", { calculator: id });
    }, 1500);
    return () => clearTimeout(timer);
  }, [config, id, a]);

  /** Mirror the inputs into the URL so a result stays shareable.
   *
   * React state is the source of truth — the URL is only a snapshot — so this
   * uses the native History API instead of `router.replace`. Next syncs
   * `usePathname` / `useSearchParams` from it, but does NOT request the route's
   * RSC payload: `router.replace` fired one ~10KB round-trip per keystroke,
   * which a slider drag turned into hundreds.
   *
   * Debounced because Safari throttles `replaceState` past roughly 100 calls
   * per 30s, and a drag blows through that on its own. */
  const urlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commit = useCallback(
    (nextA: CalcValues, nextB: CalcValues, nextCompare: boolean) => {
      const qs = buildSearch(config, nextA, nextB, nextCompare);
      if (urlTimer.current) clearTimeout(urlTimer.current);
      urlTimer.current = setTimeout(() => {
        window.history.replaceState(null, "", `${pathname}?${qs}`);
      }, 300);
    },
    [config, pathname],
  );

  useEffect(
    () => () => {
      if (urlTimer.current) clearTimeout(urlTimer.current);
    },
    [],
  );

  // One-time prefill from what we know about the signed-in user (profile,
  // synced logs, saved calculations), only on a fresh visit (no shared or
  // edited state in the URL). Runs client-side so the page stays statically
  // generated. Values stay fully editable afterwards.
  const prefillRan = useRef(false);
  useEffect(() => {
    if (prefillRan.current) return;
    prefillRan.current = true;
    const urlHasState =
      config.fields.some((f) => searchParams.get(f.name) !== null) ||
      searchParams.get("b") !== null ||
      searchParams.get("compare") !== null;
    if (urlHasState) return;

    let active = true;
    void getCalcFacts().then((facts) => {
      if (!active || !facts) return;
      const { values, changed } = applyFactsToValues(config, a, facts);
      if (changed) {
        setA(values);
        setPrefilled(true);
        commit(values, b, compare);
      }
      if (hasUnits) {
        setUnits(facts.unitsPreference === "lb" ? "imperial" : "metric");
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    track("compare_toggled", { calculator: id, on: next });
  };

  return (
    <div className="rounded-card border border-ink-600 bg-ink-800 p-4 sm:p-6">
      {/* The actions sit on top, ahead of anything whose height depends on
          the inputs (prefill notice, out-of-range errors, compare columns),
          so they never move while you use the calculator. */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {hasUnits ? (
          <Segmented
            value={units}
            onValueChange={setUnitsPersist}
            options={[
              { value: "metric", label: t("calc.metric") },
              { value: "imperial", label: t("calc.imperial") },
            ]}
            aria-label={t("settings.units")}
            className="w-full max-w-xs"
          />
        ) : null}
        <div
          role="group"
          aria-label={t("calc.actions")}
          className="flex flex-wrap items-center gap-2 sm:ml-auto"
        >
          <ShareDialog calcId={id} locale={locale} search={search} />
          <SaveCalcButton id={id} values={a} canSave={canSave} />
          <button
            type="button"
            onClick={toggleCompare}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-field border px-3.5 text-xs font-medium transition-colors",
              "focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none",
              compare
                ? "border-transparent bg-brand text-brand-contrast hover:bg-brand/90"
                : "border-brand/40 text-brand hover:bg-brand/10",
            )}
          >
            <StableLabel
              labels={[t("calc.compare"), t("calc.compareExit")]}
              current={compare ? t("calc.compareExit") : t("calc.compare")}
            />
          </button>
        </div>
      </div>
      {prefilled && (
        <div className="mb-5 flex items-center gap-2 rounded-field border border-brand/25 bg-brand/5 px-3 py-2 text-xs text-ink-300">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          <span>{t("calc.profilePrefilled")}</span>
          <button
            type="button"
            onClick={() => setPrefilled(false)}
            aria-label={t("toast.dismiss")}
            className="-m-1.5 ml-auto shrink-0 rounded-md p-1.5 text-ink-400 transition-colors hover:text-ink-100 focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:outline-none"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {compare ? (
        <div className="space-y-6">
          <div className="grid gap-x-6 gap-y-8 md:grid-cols-2">
            {/* Each column is a named group: both hold the same controls
                ("Increase weight" twice), and the group says which is which. */}
            <div
              role="group"
              aria-labelledby={`${scenarioId}-a`}
              className="space-y-4"
            >
              <ScenarioBadge tag="A" id={`${scenarioId}-a`} />
              <FieldInputs
                config={config}
                values={a}
                units={units}
                onChange={updateA}
              />
              <ResultPanel config={config} values={aDebounced} compact />
              <ResultAnnouncer
                config={config}
                values={aDebounced}
                prefix={t("calc.scenarioA")}
              />
            </div>
            <div
              role="group"
              aria-labelledby={`${scenarioId}-b`}
              className="space-y-4"
            >
              <ScenarioBadge tag="B" id={`${scenarioId}-b`} />
              <FieldInputs
                config={config}
                values={b}
                units={units}
                onChange={updateB}
              />
              <ResultPanel config={config} values={bDebounced} compact />
              <ResultAnnouncer
                config={config}
                values={bDebounced}
                prefix={t("calc.scenarioB")}
              />
            </div>
          </div>
          <DeltaBar config={config} a={aDebounced} b={bDebounced} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Result as a full-width band on top. Deliberately not sticky: a
              pinned panel covered the inputs on short viewports. */}
          <ResultPanel config={config} values={aDebounced} />
          <ResultAnnouncer config={config} values={aDebounced} />
          <FieldInputs
            config={config}
            values={a}
            units={units}
            onChange={updateA}
            columns
          />
        </div>
      )}
    </div>
  );
};
