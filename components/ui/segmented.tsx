"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
};

/**
 * Single-choice segmented control (Radix ToggleGroup) with a sliding active
 * pill. The pill is pure CSS: the group exposes the active index and the
 * option count as custom properties, and the pill translates by its own width
 * — no measuring, no animation runtime. The pill is light with dark text, as
 * in the app: a dark-grey pill on the dark track was 1.14:1, so the selection
 * hung on a text-colour change alone. A label too long for its share of a
 * narrow screen wraps to a second line and then ends in an ellipsis; it never
 * spills into its neighbour.
 */
export const Segmented = <T extends string>({
  value,
  onValueChange,
  options,
  size = "md",
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof ToggleGroup.Root>,
  "type" | "value" | "defaultValue" | "onValueChange" | "dir"
> & {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  size?: "sm" | "md";
}) => {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const style = {
    gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
    "--seg-i": index,
    "--seg-n": options.length,
  } as CSSProperties;

  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => {
        // Radix emits "" when the active item is clicked again; a segmented
        // control always has exactly one selection.
        if (next) onValueChange(next as T);
      }}
      className={cn(
        "relative isolate grid rounded-field border border-ink-600 bg-ink-900 p-1",
        className,
      )}
      style={style}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-1 -z-10 rounded-[calc(var(--radius-field)-0.25rem)] bg-ink-50 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: "calc((100% - 0.5rem) / var(--seg-n))",
          transform: "translateX(calc(var(--seg-i) * 100%))",
        }}
      />
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          className={cn(
            "relative z-10 flex min-w-0 items-center justify-center rounded-[calc(var(--radius-field)-0.25rem)] text-center leading-tight font-medium text-ink-400 transition-colors",
            "hover:text-ink-100 data-[state=on]:text-ink-950 data-[state=on]:hover:text-ink-950",
            "focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none",
            size === "sm"
              ? "min-h-8 px-2 py-1 text-xs"
              : "min-h-10 px-3 py-1.5 text-sm",
          )}
        >
          <span className="line-clamp-2 [overflow-wrap:anywhere]">
            {o.label}
          </span>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
};
