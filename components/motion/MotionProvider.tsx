"use client";

import { LazyMotion, MotionConfig } from "motion/react";

const loadFeatures = () =>
  import("@/components/motion/features").then((mod) => mod.default);

/**
 * Scoped animation runtime. `LazyMotion` + the `m` components keep the initial
 * cost near 5 KB and fetch the real feature set only once a wrapped surface
 * mounts, so calculator and doc pages that never render it pay nothing.
 * `strict` throws if a full `motion.*` component sneaks in. Reduced-motion
 * follows the OS setting.
 */
export const MotionProvider = ({ children }: { children: React.ReactNode }) => (
  <LazyMotion features={loadFeatures} strict>
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  </LazyMotion>
);
