"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Scroll-driven parallax — translates its children on the Y axis as the element
 * moves through the viewport. Vanilla (no animation library): a passive scroll
 * listener throttled with `requestAnimationFrame`, writing only `transform`
 * (GPU, no layout). Desktop-only and a no-op under `prefers-reduced-motion`.
 */
export const Parallax = ({
  children,
  offset = 40,
  className,
}: {
  children: React.ReactNode;
  /** Total travel in px across the scroll range (split ± around center). */
  offset?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(min-width: 1024px)").matches
    ) {
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = Math.max(
        0,
        Math.min(1, (vh - rect.top) / (vh + rect.height)),
      );
      const y = offset - progress * offset * 2; // offset → -offset
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [offset]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
};
