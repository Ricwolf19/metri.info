"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/lib/i18n";
import { alternatePathname } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

/** EN/ES switch — navigates to the current page's sibling-language URL
 * (path-based i18n), so each language stays a distinct, indexable URL. */
export const LocaleToggle = ({ className }: { className?: string }) => {
  const { locale } = useI18n();
  const pathname = usePathname() ?? "/";
  const target = locale === "en" ? "es" : "en";
  const href = alternatePathname(pathname, target);

  return (
    <Link
      href={href}
      hrefLang={target}
      aria-label={`Switch language to ${target === "en" ? "English" : "Español"}`}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 px-2.5 font-mono text-xs font-semibold text-ink-200 uppercase transition-colors hover:bg-ink-700 hover:text-ink-50",
        className,
      )}
    >
      {target}
    </Link>
  );
};
