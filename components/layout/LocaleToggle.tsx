"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** EN/ES switch. Persists to cookie + localStorage so SSR picks it up. */
export const LocaleToggle = ({ className }: { className?: string }) => {
  const { locale, setLocale } = useI18n();
  const next = locale === "en" ? "es" : "en";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={`Switch language to ${next === "en" ? "English" : "Español"}`}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 px-2.5 font-mono text-xs font-semibold uppercase text-ink-200 transition-colors hover:bg-ink-700 hover:text-ink-50",
        className,
      )}
    >
      {locale}
    </button>
  );
};
