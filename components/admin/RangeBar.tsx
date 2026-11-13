import Form from "next/form";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  type AnalyticsWindow,
  PRESET_LABEL,
  RANGE_PRESETS,
  type SearchParams,
  searchWith,
  windowLabel,
} from "@/lib/analytics/range";
import { cn } from "@/lib/utils";

const RANGE_KEYS = new Set(["range", "from", "to"]);

/**
 * The date window of an analytics page: preset links and a custom from/to
 * form, both plain navigations (no client JS of its own), keeping every other
 * param on the URL. `note` says what the source does with the window (a lag,
 * a clamp, a time zone).
 */
export const RangeBar = ({
  pathname,
  params,
  window,
  today,
  note,
}: {
  pathname: string;
  params: SearchParams;
  window: AnalyticsWindow;
  today: string;
  note?: string;
}) => {
  const kept = Object.entries(params).flatMap(([key, value]) => {
    const v = Array.isArray(value) ? value[0] : value;
    return RANGE_KEYS.has(key) || v === undefined ? [] : [[key, v] as const];
  });
  return (
    <div className="mb-6 space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <nav
          aria-label="Date range"
          className="flex rounded-field border border-ink-600 bg-ink-900 p-1"
        >
          {RANGE_PRESETS.map((preset) => {
            const active = window.preset === preset;
            return (
              <Link
                key={preset}
                href={`${pathname}${searchWith(params, { range: preset, from: null, to: null })}`}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "rounded-[calc(var(--radius-field)-0.25rem)] px-3 py-1.5 font-mono text-xs whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:outline-none",
                  active
                    ? "bg-ink-50 text-ink-950"
                    : "text-ink-400 hover:text-ink-100",
                )}
              >
                {PRESET_LABEL[preset]}
              </Link>
            );
          })}
        </nav>
        <Form
          key={`${window.startDate}:${window.endDate}`}
          action={pathname}
          className="flex flex-wrap items-end gap-2"
        >
          {kept.map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <label className="space-y-1 text-xs text-ink-400">
            <span className="block">From</span>
            <input
              type="date"
              name="from"
              defaultValue={window.startDate}
              max={today}
              className="h-9 rounded-field border border-ink-600 bg-ink-900 px-2 font-mono text-xs text-ink-100 [color-scheme:dark] focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none"
            />
          </label>
          <label className="space-y-1 text-xs text-ink-400">
            <span className="block">To</span>
            <input
              type="date"
              name="to"
              defaultValue={window.endDate}
              max={today}
              className="h-9 rounded-field border border-ink-600 bg-ink-900 px-2 font-mono text-xs text-ink-100 [color-scheme:dark] focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none"
            />
          </label>
          <Button type="submit" variant="secondary" size="sm">
            Apply
          </Button>
        </Form>
      </div>
      <p className="text-xs text-ink-400">
        <span className="font-mono text-ink-200">{windowLabel(window)}</span>
        {note ? ` · ${note}` : null}
      </p>
    </div>
  );
};
