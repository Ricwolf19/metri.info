"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { CALC_ICONS } from "@/components/calculators/calcIcons";
import { BookIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import type { CalcRouteId } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

export type MarqueeItem = {
  href: string;
  label: string;
  /** Picks the calculator's icon; docs get the book. */
  calcId?: CalcRouteId;
};

/** How long after a wheel / touch / drag the strip waits before it glides again. */
const USER_HOLD_MS = 1600;

/**
 * A strip of chips that glides endlessly, but is still a real scroll
 * container: the motion is `scrollLeft` advanced per frame over two copies of
 * the content and wrapped at one copy's width, so wheel, trackpad and touch
 * scrolling just work, and the strip resumes from wherever the reader left it.
 * It rests while the pointer is anywhere over the band (the padding is the
 * "near" zone), while a chip has focus, and under reduced motion.
 */
export const Marquee = ({
  items,
  labelKey,
  direction = "left",
  speed = 36,
  className,
}: {
  items: MarqueeItem[];
  labelKey: TranslationKey;
  direction?: "left" | "right";
  /** CSS px per second. */
  speed?: number;
  className?: string;
}) => {
  const t = useT();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const restingRef = useRef(false);
  const userUntilRef = useRef(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const copyWidth = () => el.scrollWidth / 2;
    let pos = direction === "right" ? copyWidth() : 0;
    el.scrollLeft = pos;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = copyWidth();
      if (w > 0) {
        if (now < userUntilRef.current) {
          pos = el.scrollLeft;
        } else if (!restingRef.current) {
          pos += (direction === "left" ? 1 : -1) * speed * dt;
        }
        if (pos >= w) pos -= w;
        else if (pos < 0) pos += w;
        if (Math.abs(el.scrollLeft - pos) >= 0.5) el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const hold = () => {
      userUntilRef.current = performance.now() + USER_HOLD_MS;
    };
    const opts = { passive: true } as const;
    el.addEventListener("wheel", hold, opts);
    el.addEventListener("touchstart", hold, opts);
    el.addEventListener("touchmove", hold, opts);
    el.addEventListener("pointerdown", hold, opts);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("wheel", hold);
      el.removeEventListener("touchstart", hold);
      el.removeEventListener("touchmove", hold);
      el.removeEventListener("pointerdown", hold);
    };
  }, [direction, speed]);

  return (
    <div
      className={cn("py-2", className)}
      onPointerEnter={() => {
        restingRef.current = true;
      }}
      onPointerLeave={() => {
        restingRef.current = false;
      }}
      onFocusCapture={() => {
        restingRef.current = true;
      }}
      onBlurCapture={() => {
        restingRef.current = false;
      }}
    >
      <div
        ref={scrollerRef}
        aria-label={t(labelKey)}
        className="marquee flex [scrollbar-width:none] gap-3 overflow-x-auto overscroll-x-contain px-6 [&::-webkit-scrollbar]:hidden"
      >
        {[0, 1].map((copy) =>
          items.map(({ href, label, calcId }) => {
            const Icon = calcId ? CALC_ICONS[calcId] : BookIcon;
            return (
              <Link
                key={`${copy}-${href}`}
                href={href}
                aria-hidden={copy === 1 || undefined}
                tabIndex={copy === 1 ? -1 : undefined}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-ink-600 bg-ink-800 py-2 pr-4 pl-3 text-sm text-ink-200 transition-[transform,border-color,background-color,color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:bg-ink-750 hover:text-ink-50 hover:shadow-lg hover:shadow-brand/10 focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-none"
              >
                <Icon
                  size={16}
                  className="text-brand transition-transform duration-200 group-hover:scale-110"
                />
                {label}
              </Link>
            );
          }),
        )}
      </div>
    </div>
  );
};
