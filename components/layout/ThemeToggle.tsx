"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

/** Compact light/dark switch. Cycles between explicit light and dark (a full
 * system/light/dark picker lives in the mobile app's settings). */
export const ThemeToggle = ({ className }: { className?: string }) => {
  const { scheme, setPreference } = useTheme();
  const t = useT();
  const next = scheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      aria-label={`${t("theme.title")}: ${t(`theme.${next}`)}`}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-ink-200 transition-colors hover:bg-ink-700 hover:text-ink-50",
        className,
      )}
    >
      {scheme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
};
