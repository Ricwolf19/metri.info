"use client";

import { motion } from "framer-motion";

import { fadeInUp, inViewOnce, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

/** Reveals children on scroll with a staggered fade-up — the web equivalent of
 * the mobile app's FadeInUp-on-mount pattern. Wrap items in <AnimatedItem>. */
export const AnimatedSection = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <motion.div
    variants={staggerContainer}
    initial="hidden"
    whileInView="visible"
    viewport={inViewOnce}
    className={className}
  >
    {children}
  </motion.div>
);

export const AnimatedItem = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <motion.div variants={fadeInUp} className={cn(className)}>
    {children}
  </motion.div>
);
