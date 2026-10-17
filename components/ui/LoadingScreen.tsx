import { MetriMark } from "@/components/layout/MetriMark";
import { cn } from "@/lib/utils";

/**
 * The app's loader, ported from mobile `AppLoader`: the brand mark breathing
 * (opacity 0.6→1, scale 0.94→1.05, 950 ms each way) inside a slow lime arc.
 * Pure CSS, so it works in server `loading.tsx` boundaries and Suspense
 * fallbacks alike, and it always sits in the middle of whatever it replaces:
 * `fullScreen` fills the viewport, otherwise it fills its container with a
 * floor height. This is the one loading state the site uses; there are no
 * grey skeleton blocks.
 */
export const LoadingScreen = ({
  label,
  variant = "block",
  size = 72,
  className,
}: {
  label?: string;
  /** `block`: fills its container (floor 22rem). `route`: fills the viewport
   * below the 4rem header, for `loading.tsx` files, so the mark sits in the
   * middle of the screen instead of at the top of an empty page. `screen`:
   * the whole viewport. */
  variant?: "block" | "route" | "screen";
  size?: number;
  className?: string;
}) => {
  const mode = variant;
  const ring = size + 36;
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "flex w-full flex-1 flex-col items-center justify-center gap-6 bg-ink-900",
        mode === "screen"
          ? "min-h-dvh"
          : mode === "route"
            ? "min-h-[calc(100dvh-4rem)]"
            : "min-h-[22rem]",
        className,
      )}
    >
      <span
        className="relative flex items-center justify-center"
        style={{ width: ring, height: ring }}
      >
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full animate-[spin_2.4s_linear_infinite]"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            className="stroke-ink-700"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            className="stroke-brand"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="28 100"
          />
        </svg>
        <MetriMark
          className="animate-breathe"
          style={{ width: size, height: size }}
        />
      </span>
      {label ? (
        <p className="font-mono text-xs tracking-wide text-ink-400">{label}</p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
};
