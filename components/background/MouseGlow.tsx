"use client";

import { useEffect, useRef, useState } from "react";

export type MouseGlowProps = {
  /** Any valid CSS color. Defaults to brand lime. */
  color?: string;
  /** Inner-stop opacity (the brightest pixel). */
  intensity?: number;
  /** Glow radius from cursor in px. */
  radius?: number;
  /** Fade on `mouseleave`. */
  fadeOnLeave?: boolean;
  /** When true, the glow is always on (still follows the mouse). */
  alwaysOn?: boolean;
};

/**
 * Cursor-following glow rendered as a radial gradient inside its parent.
 * Light by default (`intensity = 0.16`) so it never competes with content.
 *
 * Mousemove updates CSS vars (`--mouse-x`, `--mouse-y`); the gradient is set
 * via inline `background-image` so the React tree never re-renders. The
 * `mousemove`/`mouseleave`/`mouseenter` listeners attach to the PARENT (this
 * node is `pointer-events-none`, so it never sees pointer events itself) and
 * are throttled with `requestAnimationFrame`. Parent must be `position:
 * relative` (or anything other than `static`).
 */
export const MouseGlow = ({
  color = "rgba(163, 230, 53, 0.18)",
  intensity = 0.16,
  radius = 480,
  fadeOnLeave = true,
  alwaysOn = false,
}: MouseGlowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotionInitial =
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [opacity, setOpacity] = useState(
    alwaysOn || reduceMotionInitial ? intensity : 0,
  );

  useEffect(() => {
    const node = ref.current;
    const host = node?.parentElement;
    if (!node || !host) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let rafId = 0;
    let pending: { x: number; y: number } | null = null;

    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      pending = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        if (pending) {
          node.style.setProperty("--mouse-x", `${pending.x}px`);
          node.style.setProperty("--mouse-y", `${pending.y}px`);
          if (!alwaysOn) setOpacity(intensity);
        }
        rafId = 0;
      });
    };

    const onLeave = () => {
      if (fadeOnLeave && !alwaysOn) setOpacity(0);
    };

    const onEnter = () => {
      if (!alwaysOn) setOpacity(intensity);
    };

    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseleave", onLeave);
    host.addEventListener("mouseenter", onEnter);

    return () => {
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
      host.removeEventListener("mouseenter", onEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [intensity, alwaysOn, fadeOnLeave]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 transition-opacity duration-500"
      style={{
        opacity,
        background: `radial-gradient(${radius}px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${color}, transparent 60%)`,
      }}
    />
  );
};
