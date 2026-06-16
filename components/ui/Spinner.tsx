import { cn } from "@/lib/utils";

const SIZES = { sm: 14, md: 18, lg: 28 } as const;

type SpinnerSize = keyof typeof SIZES;

/**
 * Tokenized loading spinner. Inherits `currentColor` so it adopts the button or
 * text color it sits in. `role="status"` + an sr-only label keep it accessible.
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
    <span role="status" className={cn("inline-flex", className)}>
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
