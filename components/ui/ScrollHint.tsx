"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Edges = { left: boolean; right: boolean };

/**
 * Edge hints for a horizontal scroller: a fade plus a nudging chevron on
 * whichever side still has content, so a row of tabs that runs past a phone
 * screen does not read as finished. Wrap the scroller (it must be the single
 * child); the hints are decorative and vanish once the row fits or is
 * scrolled to that end. `fade` is the page colour the fade dissolves into.
 */
export const ScrollHint = ({
  children,
  className,
  fade = "from-ink-900",
  hintClassName,
}: {
  children: React.ReactNode;
  className?: string;
  fade?: string;
  /** Extra classes on both hints, e.g. `lg:hidden` when the row stops
   * scrolling at a breakpoint. */
  hintClassName?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edges>({ left: false, right: false });

  useEffect(() => {
    const scroller = ref.current?.firstElementChild;
    if (!(scroller instanceof HTMLElement)) return;
    const measure = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scroller;
      const next = {
        left: scrollLeft > 2,
        right: scrollLeft + clientWidth < scrollWidth - 2,
      };
      setEdges((prev) =>
        prev.left === next.left && prev.right === next.right ? prev : next,
      );
    };
    measure();
    scroller.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    for (const child of scroller.children) ro.observe(child);
    return () => {
      scroller.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, []);

  const hint =
    "pointer-events-none absolute inset-y-0 flex w-14 items-center transition-opacity duration-300";

  return (
    <div ref={ref} className={cn("relative", className)}>
      {children}
      <span
        aria-hidden
        className={cn(
          hint,
          "left-0 justify-start bg-gradient-to-r to-transparent pl-0.5",
          fade,
          edges.left ? "opacity-100" : "opacity-0",
          hintClassName,
        )}
      >
        <span className="-scale-x-100">
          <span className="animate-nudge-x inline-flex rounded-full bg-ink-800/90 p-1 text-brand shadow-sm shadow-ink-950/40">
            <ChevronRightIcon size={14} />
          </span>
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          hint,
          "right-0 justify-end bg-gradient-to-l to-transparent pr-0.5",
          fade,
          edges.right ? "opacity-100" : "opacity-0",
          hintClassName,
        )}
      >
        <span className="animate-nudge-x inline-flex rounded-full bg-ink-800/90 p-1 text-brand shadow-sm shadow-ink-950/40">
          <ChevronRightIcon size={14} />
        </span>
      </span>
    </div>
  );
};
