import { cn } from "@/lib/utils";

/**
 * A button label that keeps one width across its states ("Save" → "Saving…" →
 * "Saved"): every variant sits in the same grid cell and only `current` is
 * visible, so the box is as wide as the longest one and the buttons beside it
 * never shift. Hidden variants are `visibility: hidden`, so screen readers hear
 * only the visible one.
 */
export const StableLabel = ({
  labels,
  current,
  className,
}: {
  labels: readonly string[];
  current: string;
  className?: string;
}) => (
  <span className={cn("inline-grid", className)}>
    {labels.map((label) => (
      <span
        key={label}
        className={cn(
          "col-start-1 row-start-1 text-center",
          label !== current && "invisible",
        )}
      >
        {label}
      </span>
    ))}
  </span>
);
