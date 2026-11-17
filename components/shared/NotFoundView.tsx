"use client";

import Link from "next/link";

import { CenteredScreen } from "@/components/shared/CenteredScreen";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";

/** The 404 page, in the language of the URL that missed (`I18nProvider`
 * reads it from the path): what happened and the three ways back in. */
export const NotFoundView = () => {
  const { t, locale } = useI18n();
  return (
    <CenteredScreen className="text-center">
      <p className="font-mono text-xs font-medium tracking-widest text-brand uppercase">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance text-ink-50 sm:text-4xl">
        {t("notFound.title")}
      </h1>
      <p className="mt-4 max-w-md text-pretty text-ink-300">
        {t("notFound.body")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={routePath("home", locale)} className={buttonVariants()}>
          {t("nav.home")}
        </Link>
        <Link
          href={routePath("tools", locale)}
          className={buttonVariants({ variant: "secondary" })}
        >
          {t("nav.tools")}
        </Link>
        <Link
          href={routePath("docs", locale)}
          className={buttonVariants({ variant: "outline" })}
        >
          {t("nav.docs")}
        </Link>
      </div>
    </CenteredScreen>
  );
};
