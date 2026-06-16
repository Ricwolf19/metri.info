import type { Variants } from "framer-motion";

/** Web equivalents of the mobile app's RN Animated patterns. */

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

/** Default `whileInView` viewport config used across marketing sections. */
export const inViewOnce = { once: true, margin: "-80px" } as const;
