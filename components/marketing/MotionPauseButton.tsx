"use client";

import { PauseIcon, PlayIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { setMotionPaused, useMotionPaused } from "@/lib/motion-prefs";
import { cn } from "@/lib/utils";

/**
 * Stops the landing's ambient motion (the marquee strips, the hero's dot
 * field, the rotating example) and starts it again. One name, the state in
 * `aria-pressed`; the choice is remembered (`lib/motion-prefs`).
 */
export const MotionPauseButton = ({ className }: { className?: string }) => {
  const t = useT();
  const paused = useMotionPaused();
  return (
    <button
      type="button"
      onClick={() => setMotionPaused(!paused)}
      aria-pressed={paused}
      aria-label={t("motion.pause")}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-600 bg-ink-900/90 text-ink-300 shadow-lg backdrop-blur transition-colors hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:outline-none",
        className,
      )}
    >
      {paused ? <PlayIcon size={14} /> : <PauseIcon size={14} />}
    </button>
  );
};
