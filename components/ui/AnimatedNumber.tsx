"use client";

import NumberFlow from "@number-flow/react";

/**
 * Rolling-digit number for already-formatted result strings ("2,759",
 * "22.4"). Parses the number and mirrors the source's fraction digits and
 * grouping, so the first paint matches the plain string exactly and only
 * later changes animate. Anything that is not a plain number (ranges, times,
 * fractions) renders as text.
 */
const NUMERIC_RE = /^-?[\d,]*\.?\d+$/;

export const AnimatedNumber = ({
  value,
  className,
}: {
  value: string;
  className?: string;
}) => {
  const trimmed = value.trim();
  if (!NUMERIC_RE.test(trimmed))
    return <span className={className}>{value}</span>;

  const n = Number(trimmed.replace(/,/g, ""));
  if (!Number.isFinite(n)) return <span className={className}>{value}</span>;

  const fraction = trimmed.split(".")[1]?.length ?? 0;
  return (
    <NumberFlow
      value={n}
      locales="en-US"
      format={{
        minimumFractionDigits: fraction,
        maximumFractionDigits: fraction,
        useGrouping: trimmed.includes(","),
      }}
      className={className}
    />
  );
};
