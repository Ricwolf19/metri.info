import { type RefObject, useEffect } from "react";

/**
 * Keeps a fixed bottom banner (cookie consent, the install prompt) from
 * covering the control that has focus (WCAG 2.4.11): while it is shown, its
 * height plus a margin is published as `--reserve-<name>` on <html>, and
 * `globals.css` turns the larger of those into `scroll-padding-bottom`, so the
 * browser scrolls a focused field into view above the banner. Each banner
 * owns its own variable, so two at once never overwrite each other.
 */
export const useViewportReserve = (
  name: string,
  ref: RefObject<HTMLElement | null>,
  active: boolean,
): void => {
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const root = document.documentElement;
    const prop = `--reserve-${name}`;
    const publish = () => {
      root.style.setProperty(prop, `${el.offsetHeight + 24}px`);
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty(prop);
    };
  }, [name, ref, active]);
};
