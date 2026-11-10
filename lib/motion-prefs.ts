import { useSyncExternalStore } from "react";

/**
 * The two reasons ambient motion (the landing's marquee strips, the hero's
 * dot field, the rotating example result) holds still: the OS asks for
 * reduced motion, or the reader pressed the pause control (WCAG 2.2.2: anything
 * that moves on its own for more than five seconds needs one). The pause is
 * remembered, so a reader who stopped it once is not ambushed on the next
 * visit. Both are external stores, so a change applies everywhere at once.
 */
const PAUSE_KEY = "metri.motion.paused";
const PAUSE_EVENT = "metri:motion-paused";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

export const readMotionPaused = (): boolean => {
  try {
    return localStorage.getItem(PAUSE_KEY) === "1";
  } catch {
    return false;
  }
};

export const setMotionPaused = (paused: boolean): void => {
  try {
    localStorage.setItem(PAUSE_KEY, paused ? "1" : "0");
  } catch {
    /* storage refused: the event still pauses this page */
  }
  window.dispatchEvent(new Event(PAUSE_EVENT));
};

const subscribePaused = (onChange: () => void) => {
  window.addEventListener(PAUSE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PAUSE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

/** The reader's pause; `false` on the server and the first paint. */
export const useMotionPaused = (): boolean =>
  useSyncExternalStore(subscribePaused, readMotionPaused, () => false);

const subscribeReduce = (onChange: () => void) => {
  const query = matchMedia(REDUCE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** `prefers-reduced-motion`, live: a change in the OS setting applies without
 * a reload. `false` on the server. */
export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(
    subscribeReduce,
    () => matchMedia(REDUCE_QUERY).matches,
    () => false,
  );
