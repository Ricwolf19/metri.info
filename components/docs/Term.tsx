import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";

/**
 * Inline glossary term. Renders its text with a brand-green underline and links
 * to the matching glossary entry (`/docs/glossary#<id>`), which flashes on
 * arrival. A plain (server) component — `locale` is passed in (the auto-linker
 * and MDX factory have it), so term-heavy doc/calculator pages ship zero extra
 * hydration JS. Keeps the surrounding text color so it reads naturally.
 */
export const Term = ({
  id,
  locale,
  children,
}: {
  id: string;
  locale: Locale;
  children: React.ReactNode;
}) => (
  <Link
    href={`${routePath("docs", locale)}/glossary#${id}`}
    className="font-medium underline decoration-brand/50 decoration-dotted decoration-2 underline-offset-[3px] transition-colors hover:text-brand hover:decoration-brand"
  >
    {children}
  </Link>
);
