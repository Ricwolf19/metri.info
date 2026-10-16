"use client";

import { useEffect, useRef } from "react";

/** Distance between dots, in CSS px. */
const STEP = 26;
/** Radius of the pointer lens, in CSS px. */
const LENS = 180;
const MAX_DPR = 2;
const TAU = Math.PI * 2;

const smoothstep = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** Reads a space-separated RGB channel token (`--brand: 190 248 43`). */
const channels = (el: Element, name: string, fallback: string) =>
  (getComputedStyle(el).getPropertyValue(name).trim() || fallback)
    .split(/\s+/)
    .join(",");

/**
 * The hero's backdrop: a field of dots that breathes with two slow travelling
 * waves and reacts to the pointer — dots near it turn brand-lime, swell and
 * get pushed slightly outward, like a lens moving over the grid. The centre of
 * the field is kept calm so the headline stays the loudest thing on screen, and
 * the whole thing dissolves toward the bottom edge.
 *
 * Everything lives inside one effect — sizing, listeners, the rAF loop — and is
 * torn down in its cleanup, so a route hidden by React's `<Activity>` and shown
 * again simply restarts. The loop also stops while the canvas is off-screen or
 * the tab is hidden. Under reduced motion it paints a single still frame.
 */
export const HeroField = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const brand = channels(canvas, "--brand", "190 248 43");
    const ink = channels(canvas, "--ink-300", "161 161 170");

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let originX = 0;
    let originY = 0;
    let raf = 0;
    let inView = true;
    let pageVisible = !document.hidden;
    const start = performance.now();
    const pointer = { x: -9999, y: -9999, targetX: -9999, targetY: -9999 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / STEP) + 1;
      rows = Math.ceil(height / STEP) + 1;
      originX = (width - (cols - 1) * STEP) / 2;
      originY = (height - (rows - 1) * STEP) / 2;
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      pointer.x += (pointer.targetX - pointer.x) * 0.1;
      pointer.y += (pointer.targetY - pointer.y) * 0.1;

      ctx.clearRect(0, 0, width, height);
      const centreX = width / 2;
      const centreY = height * 0.46;
      const halfW = Math.max(width * 0.5, 1);
      const halfH = Math.max(height * 0.5, 1);

      for (let i = 0; i < cols; i++) {
        const x = originX + i * STEP;
        for (let j = 0; j < rows; j++) {
          const y = originY + j * STEP;

          // A slow ring rolling outward from the headline, over a long
          // diagonal swell — two periods that never line up, so the surface
          // reads as water rather than a stripe pattern.
          const dist = Math.hypot(x - centreX, y - centreY);
          const ring = 0.5 + 0.5 * Math.sin(dist * 0.024 - t * 1.15);
          const swell =
            0.5 + 0.5 * Math.sin((x * 0.55 + y * 0.85) * 0.009 + t * 0.45);
          const wave = smoothstep(0, 1, ring * 0.65 + swell * 0.35);
          let alpha = 0.06 + 0.3 * wave;

          // Calm centre under the copy, full strength toward the edges.
          const nx = (x - centreX) / halfW;
          const ny = (y - centreY) / halfH;
          const fromCentre = Math.sqrt(nx * nx + ny * ny);
          alpha *= 0.3 + 0.7 * smoothstep(0.2, 0.68, fromCentre);
          // Dissolve into the next section instead of ending on a line.
          alpha *= 1 - smoothstep(0.8, 1, y / height);

          let size = 1 + 1.1 * wave;
          let drawX = x;
          let drawY = y;
          let lit = 0;
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LENS * LENS) {
            const d = Math.sqrt(d2);
            lit = smoothstep(0, 1, 1 - d / LENS);
            alpha = Math.min(1, alpha + 0.75 * lit);
            size += 1.4 * lit;
            const push = 7 * lit;
            drawX += (dx / (d || 1)) * push;
            drawY += (dy / (d || 1)) * push;
          }

          ctx.fillStyle = `rgba(${lit > 0.02 ? brand : ink},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(drawX, drawY, size, 0, TAU);
          ctx.fill();
        }
      }
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (raf || reduceMotion || !inView || !pageVisible) return;
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = e.clientX - rect.left;
      pointer.targetY = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.targetX = -9999;
      pointer.targetY = -9999;
    };
    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) play();
      else pause();
    };

    resize();
    draw(performance.now());
    canvas.dataset.ready = "true";

    const ro = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      if (inView) play();
      else pause();
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    play();

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="hero-field absolute inset-0 h-full w-full"
    />
  );
};
