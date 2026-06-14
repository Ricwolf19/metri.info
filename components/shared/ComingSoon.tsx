import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { getLocale, getT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/en";
import { routePath } from "@/lib/i18n/routes";

/** Placeholder for sections that ship in a later phase. Server-rendered so the
 * route still returns real, indexable (but noindex) HTML in both languages. */
export const ComingSoon = async ({
  titleKey,
}: {
  titleKey: TranslationKey;
}) => {
  const [t, locale] = await Promise.all([getT(), getLocale()]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-medium text-accent">
        {t("soon.badge")}
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink-50 sm:text-5xl">
        {t(titleKey)}
      </h1>
      <p className="mt-4 max-w-md text-ink-300">{t("soon.body")}</p>
      <Link
        href={routePath("home", locale)}
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
      >
        <ArrowLeftIcon size={16} />
        {t("soon.backHome")}
      </Link>
    </Container>
  );
};
