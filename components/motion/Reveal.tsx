"use client";

import { m, type Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -80px 0px" } as const;

/** Fade-up reveal. `custom` carries a per-instance delay (seconds). */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay },
  }),
};

/**
 * Scroll-triggered reveal for anything below the fold. Must sit inside a
 * `MotionProvider`. Above-the-fold content keeps the CSS `animate-rise`
 * keyframe instead, so the server HTML paints at full opacity before hydration.
 */
export const Reveal = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <m.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={VIEWPORT}
    variants={fadeUp}
    custom={delay}
  >
    {children}
  </m.div>
);
