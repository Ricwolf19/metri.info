"use client";

import Link from "next/link";

import { MetriMark } from "@/components/layout/MetriMark";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

/** Metri wordmark — icon + label, linking to the locale-correct home. */
export const Logo = ({
  className,
  withWordmark = true,
}: {
  className?: string;
  withWordmark?: boolean;
}) => {
  const { locale } = useI18n();

  return (
    <Link
      href={routePath("home", locale)}
      aria-label="Metri home"
      className={cn("flex items-center gap-2", className)}
    >
      <MetriMark className="h-7 w-7" />
      {withWordmark && (
        <span className="font-sans text-lg font-bold tracking-tight text-ink-50">
          Metri
        </span>
      )}
    </Link>
  );
};
