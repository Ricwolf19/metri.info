"use client";

import { useEffect, useState } from "react";

import { CalcChart } from "@/components/calculators/CalcChart";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { C } from "@/lib/calculators/_shared";
import type { CalcChart as Chart } from "@/lib/calculators/types";
import { useT } from "@/lib/i18n";
import type { TFunction } from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";

/** The TDEE example cycles through the three targets so the figure reads as a
 * live calculator rather than a screenshot. Values are a fixed sample body. */
const TDEE_TARGETS: { key: TranslationKey; value: number }[] = [
  { key: "calc.goal.maintain", value: 2759 },
  { key: "calc.goal.cut", value: 2259 },
  { key: "calc.goal.bulk", value: 3059 },
];
const CYCLE_MS = 3200;

const tdeeChart = (t: TFunction, highlighted: number): Chart => ({
  kind: "bars",
  max: 3059,
  bars: [
    {
      label: t("calc.result.bmr"),
      value: 1780,
      display: "1,780",
      color: C.violet,
    },
    {
      label: t("calc.goal.cut"),
      value: 2259,
      display: "2,259",
      color: C.amber,
      highlight: highlighted === 1,
    },
    {
      label: t("calc.goal.maintain"),
      value: 2759,
      display: "2,759",
      color: "rgb(var(--brand))",
      highlight: highlighted === 0,
    },
    {
      label: t("calc.goal.bulk"),
      value: 3059,
      display: "3,059",
      color: C.blue,
      highlight: highlighted === 2,
    },
  ],
});

/**
 * A live, on-brand mock of a calculator result — the real `CalcChart` with
 * sample data, the value rolling between targets on a timer. Used to make the
 * marketing sections visual ("show, don't tell").
 */
export const CalcExample = ({
  label,
  unit,
  caption,
  className,
}: {
  label: string;
  unit?: string;
  caption?: string;
  className?: string;
}) => {
  const t = useT();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(
      () => setI((n) => (n + 1) % TDEE_TARGETS.length),
      CYCLE_MS,
    );
    return () => clearInterval(timer);
  }, []);

  const target = TDEE_TARGETS[i];

  return (
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
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs tracking-widest text-ink-400 uppercase">
            {label}
          </p>
          <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 font-mono text-[10px] tracking-wide text-brand uppercase">
            {t(target.key)}
          </span>
        </div>
        <p className="mt-1.5 font-mono text-4xl font-bold text-brand">
          <AnimatedNumber value={target.value.toLocaleString("en-US")} />
          {unit && <span className="ml-1 text-base text-ink-300">{unit}</span>}
        </p>
        <div className="mt-5">
          <CalcChart chart={tdeeChart(t, i)} size="lg" />
        </div>
        {caption && (
          <p className="mt-4 border-t border-ink-700 pt-3 text-xs leading-relaxed text-ink-400">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
};
