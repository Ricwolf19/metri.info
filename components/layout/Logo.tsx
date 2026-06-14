"use client";

import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

/** METRI wordmark — icon + label, linking to the locale-correct home. */
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
      aria-label="METRI home"
      className={cn("flex items-center gap-2", className)}
    >
      <Image
        src="/icon.svg"
        alt=""
        width={28}
        height={28}
        priority
        className="h-7 w-7"
      />
      {withWordmark && (
        <span className="font-sans text-lg font-bold tracking-tight text-ink-50">
          METRI
        </span>
      )}
    </Link>
  );
};
