"use client";

import { useT } from "@/lib/i18n";

/** The id of the root layout's `<main>`, the skip link's target. */
export const MAIN_ID = "main";

/**
 * "Skip to content": the first stop for a keyboard, hidden until it takes
 * focus, so Tab does not walk the whole header on every page. It lands on
 * `<main>` (focusable with `tabIndex={-1}` in the root layout).
 */
export const SkipLink = () => {
  const t = useT();
  return (
    <a
      href={`#${MAIN_ID}`}
      className="sr-only rounded-field bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 focus-visible:outline-none"
    >
      {t("nav.skipToContent")}
    </a>
  );
};
