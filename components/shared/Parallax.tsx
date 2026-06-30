"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Scroll-driven parallax wrapper. Translates its children on the Y axis as the
 * element scrolls through the viewport — GPU-only `transform`, so it never
 * touches layout. Honors `prefers-reduced-motion` (becomes a no-op) and keeps
 * the range small so it stays cheap on mobile. Reusable: drop it around any
 * visual layer and tune `offset`.
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
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [offset, -offset],
  );

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  );
};
