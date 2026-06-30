"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Scroll-reveal with a staggered fade-up — IntersectionObserver + the CSS
 * `metri-rise` keyframe (no animation library). `AnimatedSection` injects a
 * per-child `delay` for the stagger; each `AnimatedItem` reveals once when it
 * enters the viewport. `prefers-reduced-motion` is handled globally (the rise
 * keyframe collapses to ~0ms).
 */
export const AnimatedItem = ({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(visible ? "animate-rise" : "opacity-0", className)}
      style={visible && delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
};

export const AnimatedSection = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={className}>
    {Children.map(children, (child, i) =>
      isValidElement(child)
        ? cloneElement(child as React.ReactElement<{ delay?: number }>, {
            delay: i * 0.06,
          })
        : child,
    )}
  </div>
);
