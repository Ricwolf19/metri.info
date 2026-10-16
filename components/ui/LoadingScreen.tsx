import { MetriMark } from "@/components/layout/MetriMark";
import { cn } from "@/lib/utils";

/**
 * The app's loader, ported from mobile `AppLoader`: the brand mark breathing
 * (opacity 0.6→1, scale 0.94→1.05, 950 ms each way). Pure CSS, so it works in
 * server `loading.tsx` boundaries and Suspense fallbacks alike. `fullScreen`
 * fills the viewport; otherwise it fills its container with a floor height.
 */
export const LoadingScreen = ({
  label,
  fullScreen = false,
  size = 64,
  className,
}: {
  label?: string;
  fullScreen?: boolean;
  size?: number;
  className?: string;
}) => (
  <div
    role="status"
    aria-busy="true"
    aria-live="polite"
    className={cn(
      "flex w-full flex-col items-center justify-center gap-5 bg-ink-900",
      fullScreen ? "min-h-dvh" : "min-h-[18rem]",
      className,
    )}
  >
    <MetriMark
      className="animate-breathe"
      style={{ width: size, height: size }}
    />
    {label ? (
      <p className="font-mono text-xs tracking-wide text-ink-400">{label}</p>
    ) : (
      <span className="sr-only">Loading</span>
    )}
  </div>
);
