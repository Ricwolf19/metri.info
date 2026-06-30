"use client";

import { cn } from "@/lib/utils";

/**
 * Elevated card with a hairline border + top sheen, and a brand spotlight that
 * follows the cursor on hover (radial gradient from `--mx`/`--my`, set on mousemove).
 */
export const GlowCard = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      onMouseMove={handleMove}
      className={cn(
        "group relative overflow-hidden rounded-card border border-ink-600 bg-ink-800 p-6 transition-all duration-300",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-ink-50/15 before:to-transparent",
        "hover:-translate-y-0.5 hover:border-ink-500 hover:shadow-[0_12px_36px_-14px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="spotlight-overlay pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </div>
  );
};
