"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { CheckIcon, CopyIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { CALCULATORS } from "@/lib/calculators/registry";
import type { CalcId, CalcValues } from "@/lib/calculators/types";
import { cn } from "@/lib/utils";

export const Calculator = ({ id }: { id: CalcId }) => {
  const config = CALCULATORS[id];
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

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
    // Initialise once from URL; subsequent edits are local state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [values, setValues] = useState<CalcValues>(initial);

  const update = useCallback(
    (name: string, value: number | string) => {
      const next = { ...values, [name]: value };
      setValues(next);
      const params = new URLSearchParams();
      for (const f of config.fields) params.set(f.name, String(next[f.name]));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [values, config.fields, router, pathname],
  );

  const result = useMemo(() => config.compute(values), [config, values]);

  const share = useCallback(() => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }, []);

  return (
    <div className="grid gap-6 rounded-card border border-ink-600 bg-ink-800 p-6 md:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-4">
        {config.fields.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-200">
              {t(f.labelKey)}
            </span>
            {f.kind === "number" ? (
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={String(values[f.name] ?? "")}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  onChange={(e) => update(f.name, Number(e.target.value))}
                  className="h-11 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 pr-12 font-mono text-ink-50 focus:border-lime-400/40 focus:ring-2 focus:ring-lime-400/20 focus:outline-none"
                />
                {f.unit && (
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ink-400">
                    {f.unit}
                  </span>
                )}
              </div>
            ) : (
              <select
                value={String(values[f.name] ?? "")}
                onChange={(e) => update(f.name, e.target.value)}
                className="h-11 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 text-ink-50 focus:border-lime-400/40 focus:ring-2 focus:ring-lime-400/20 focus:outline-none"
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>

      {/* Result */}
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
              <span className="mt-3 inline-flex w-fit items-center rounded-md border border-lime-400/25 bg-lime-400/10 px-2 py-0.5 text-xs font-medium text-accent">
                {t(result.noteKey)}
              </span>
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
            <button
              type="button"
              onClick={share}
              className={cn(
                "mt-auto inline-flex items-center justify-center gap-2 self-start rounded-lg border border-ink-600 px-3 py-2 text-xs font-medium transition-colors",
                copied
                  ? "border-lime-400/40 text-accent"
                  : "text-ink-300 hover:bg-ink-700 hover:text-ink-50",
              )}
            >
              {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              {copied ? t("calc.copied") : t("calc.share")}
            </button>
          </>
        ) : (
          <p className="m-auto text-sm text-ink-400">{t("common.loading")}</p>
        )}
      </div>
    </div>
  );
};
