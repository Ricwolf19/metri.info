import { cn } from "@/lib/utils";

/**
 * Larger brand spinner — a lime arc over an ink track. Pure CSS animation, no
 * client JS, so it works in server `loading.tsx` boundaries.
 */
const BrandSpinner = ({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={cn("animate-spin", className)}
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="rgb(var(--ink-700))"
      strokeWidth="2.25"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="rgb(var(--brand))"
      strokeWidth="2.25"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * A centered loading state for whole screens or component areas — use in
 * `loading.tsx`, Suspense fallbacks, or while a section fetches, so the UI shows
 * a deliberate "loading" state instead of an empty flash. `fullScreen` fills the
 * viewport; otherwise it fills its container (min height keeps it from
 * collapsing). Pass `label` to name what's loading.
 */
export const LoadingScreen = ({
  label,
  fullScreen = false,
  className,
}: {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}) => (
  <div
    role="status"
    aria-busy="true"
    aria-live="polite"
    className={cn(
      "flex w-full flex-col items-center justify-center gap-4",
      fullScreen ? "min-h-dvh" : "min-h-[18rem]",
      className,
    )}
  >
    <BrandSpinner />
    {label ? (
      <p className="font-mono text-xs tracking-wide text-ink-400">{label}</p>
    ) : (
      <span className="sr-only">Loading</span>
    )}
  </div>
);
