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

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const scaleOnHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

export const glowPulse: Variants = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(190, 248, 43, 0.10)",
      "0 0 40px rgba(190, 248, 43, 0.20)",
      "0 0 20px rgba(190, 248, 43, 0.10)",
    ],
    transition: { duration: 3, repeat: Infinity },
  },
};

/** Default `whileInView` viewport config used across marketing sections. */
export const inViewOnce = { once: true, margin: "-80px" } as const;
