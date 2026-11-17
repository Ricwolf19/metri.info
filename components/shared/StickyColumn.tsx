import { cn } from "@/lib/utils";

/**
 * A side column's content that stays in view while the main column scrolls,
 * from `lg` up, where the two sit side by side (below that it's just part of
 * the page). It never grows past the screen: a column taller than that
 * scrolls inside itself, so its end is always reachable. The 1-unit inset
 * keeps focus rings from being clipped by that scroll box.
 */
export const StickyColumn = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "lg:sticky lg:top-24 lg:-m-1 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:p-1",
      className,
    )}
  >
    {children}
  </div>
);
