import type { UseFormRegisterReturn } from "react-hook-form";

import { cn } from "@/lib/utils";

export type Choice = {
  value: string;
  label: string;
  description?: string;
  /** A short tag on the right, e.g. a body-fat range. */
  meta?: string;
};

/**
 * One question's answers as tappable cards: native radios (so arrow keys,
 * focus and form state come for free) registered with react-hook-form, the
 * whole card as the hit area and the checked one tinted brand.
 */
export const ChoiceCards = ({
  legend,
  choices,
  registration,
  columns = false,
  describedBy,
}: {
  legend: string;
  choices: Choice[];
  registration: UseFormRegisterReturn;
  columns?: boolean;
  describedBy?: string;
}) => (
  <fieldset aria-describedby={describedBy}>
    <legend className="sr-only">{legend}</legend>
    <div className={cn("grid gap-2", columns && "sm:grid-cols-2")}>
      {choices.map((c) => (
        <label
          key={c.value}
          className={cn(
            "flex min-w-0 cursor-pointer items-center gap-3 rounded-field border border-ink-600 bg-ink-850 px-4 py-3 transition-colors",
            "hover:border-ink-500 hover:bg-ink-800",
            "has-[:checked]:border-brand/60 has-[:checked]:bg-brand/10",
            "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40",
          )}
        >
          <input
            type="radio"
            value={c.value}
            className="peer sr-only"
            {...registration}
          />
          <span
            aria-hidden
            className="flex size-4 shrink-0 items-center justify-center rounded-full border border-ink-500 peer-checked:border-brand peer-checked:[&>span]:scale-100"
          >
            <span className="size-2 scale-0 rounded-full bg-brand transition-transform" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium [overflow-wrap:anywhere] text-ink-50">
              {c.label}
            </span>
            {c.description ? (
              <span className="mt-0.5 block text-xs [overflow-wrap:anywhere] text-ink-400">
                {c.description}
              </span>
            ) : null}
          </span>
          {c.meta ? (
            <span className="shrink-0 font-mono text-xs text-ink-300">
              {c.meta}
            </span>
          ) : null}
        </label>
      ))}
    </div>
  </fieldset>
);
