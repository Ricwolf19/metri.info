import type { FunnelStep } from "@/lib/analytics/posthog";

const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

/**
 * Vertical conversion funnel: one bar per step, width relative to the first
 * step, annotated with the overall % (of step 1) and the step-to-step drop. The
 * narrowing bars make the biggest leak obvious at a glance.
 */
export const FunnelChart = ({
  steps,
  emptyLabel = "No data yet",
}: {
  steps: FunnelStep[];
  emptyLabel?: string;
}) => {
  const top = steps[0]?.count ?? 0;
  if (steps.length === 0 || top === 0) {
    return <p className="text-sm text-ink-400">{emptyLabel}</p>;
  }

  return (
    <ol className="space-y-2.5">
      {steps.map((step, i) => {
        const prev = i === 0 ? step.count : steps[i - 1].count;
        const width = Math.max(pct(step.count, top), 2);
        return (
          <li key={step.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate text-ink-200">
                {i + 1}. {step.label}
              </span>
              <span className="shrink-0 font-mono text-ink-100">
                {fmt(step.count)}
                <span className="ml-1.5 text-ink-400">
                  {pct(step.count, top)}%
                </span>
              </span>
            </div>
            <div className="h-6 overflow-hidden rounded-md bg-ink-700">
              <div
                className="flex h-full items-center justify-end rounded-md bg-lime-500/80 pr-2"
                style={{ width: `${width}%` }}
              >
                {i > 0 && (
                  <span className="font-mono text-[10px] text-ink-950">
                    {pct(step.count, prev)}%
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
