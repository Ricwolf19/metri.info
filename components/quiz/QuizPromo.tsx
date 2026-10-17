"use client";

import Link from "next/link";

import { ArrowRightIcon, BookIcon } from "@/components/icons";
import { ShareButton } from "@/components/shared/ShareButton";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

/**
 * The app's Explore card, on the web: a lime book tile, the title, one line of
 * what the check measures, the way in, and a share icon that passes the check
 * on. The link is stretched over the card (a button cannot live inside an
 * anchor), the share button sits above it. `compact` is the single-row form
 * for inside another card.
 */
export const QuizPromo = ({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) => {
  const { t, locale } = useI18n();
  const href = routePath("quiz", locale);
  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-card border border-ink-600 bg-ink-800 transition-colors focus-within:border-brand/40 hover:border-brand/40",
        compact ? "p-3.5" : "p-5 sm:p-6",
        className,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-brand text-brand-contrast",
          compact ? "h-10 w-10" : "h-14 w-14",
        )}
      >
        <BookIcon size={compact ? 20 : 26} />
      </span>
      <span className="min-w-0 flex-1">
        <Link
          href={href}
          className={cn(
            "block font-bold tracking-tight text-ink-50 after:absolute after:inset-0 after:rounded-card focus-visible:outline-none",
            compact ? "text-sm" : "text-lg",
          )}
        >
          {t("quiz.cardTitle")}
        </Link>
        <span
          className={cn(
            "block text-ink-300",
            compact ? "mt-0.5 text-xs" : "mt-1 text-sm",
          )}
        >
          {t("quiz.cardBody")}
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand sm:inline-flex">
        {t("quiz.cardCta")}
        <ArrowRightIcon
          size={16}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
      <ArrowRightIcon size={18} className="shrink-0 text-brand sm:hidden" />
      <ShareButton
        variant="icon"
        path={href}
        title={`${t("quiz.cardTitle")} · Metri`}
        className="relative z-10 shrink-0"
      />
    </div>
  );
};
