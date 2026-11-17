"use client";

import Link from "next/link";

import { WifiOffIcon } from "@/components/icons";
import { CenteredScreen } from "@/components/shared/CenteredScreen";
import { buttonVariants } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

/** Branded offline fallback body. The SW precaches this route's HTML so it
 * renders without a network. Locale follows the attempted URL via I18nProvider. */
export const OfflineView = () => {
  const t = useT();
  return (
    <CenteredScreen className="gap-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl border border-ink-700 bg-ink-800 text-ink-100">
        <WifiOffIcon size={32} />
      </span>
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold text-ink-50">
          {t("pwa.offlineTitle")}
        </h1>
        <p className="mx-auto max-w-xl text-balance text-ink-300">
          {t("pwa.offlineBody")}
        </p>
      </div>
      <Link href="/" className={buttonVariants({ size: "lg" })}>
        {t("pwa.offlineHome")}
      </Link>
    </CenteredScreen>
  );
};
