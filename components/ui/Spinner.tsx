import { cn } from "@/lib/utils";

const SIZES = { sm: 14, md: 18, lg: 28 } as const;

type SpinnerSize = keyof typeof SIZES;

/**
 * Tokenized loading spinner. Inherits `currentColor` so it adopts the button or
 * text color it sits in. With a `label` it is a `role="status"` region with an
 * sr-only label; without one it is decoration (the control it sits in, e.g. a
 * busy button, already says so), not an empty live region.
 */
export const Spinner = ({
  size = "md",
  label,
  className,
}: {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}) => {
  const px = SIZES[size];
  return (
    <span
      role={label ? "status" : undefined}
      className={cn("inline-flex", className)}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="animate-spin"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          className="opacity-25"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
};
