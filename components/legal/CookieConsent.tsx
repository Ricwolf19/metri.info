"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import {
  CONSENT_EVENT,
  type ConsentValue,
  readConsent,
  writeConsent,
} from "@/lib/legal/consent";
import { routePath } from "@/lib/i18n/routes";

/** Subscribe to consent changes (decision made anywhere in the tree). */
const subscribe = (onChange: () => void) => {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
};

/**
 * Cookie-consent banner — pinned to the bottom-left corner (the PWA install
 * prompt owns bottom-right). Only shown until the visitor makes a choice;
 * accepting/declining persists to a cookie and notifies analytics providers
 * via the consent event (no reload). Strictly-necessary cookies are exempt and
 * keep working regardless of the choice.
 */
export const CookieConsent = () => {
  const { t, locale } = useI18n();
  // `"ssr"` on the server / first hydration paint → render nothing, so a
  // returning visitor who already decided never sees a flash of the banner.
  const consent = useSyncExternalStore(
    subscribe,
    readConsent,
    () => "ssr" as const,
  );

  const decide = (value: ConsentValue) => writeConsent(value);

  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label={t("cookies.title")}
      className="animate-rise fixed right-4 bottom-4 z-50 max-w-[calc(100vw-2rem)] sm:max-w-sm"
    >
      <div className="rounded-card border border-ink-600 bg-ink-850/95 p-4 shadow-2xl backdrop-blur">
        <p className="font-mono text-xs leading-relaxed tracking-wide text-ink-200">
          {t("cookies.message")}{" "}
          <Link
            href={routePath("privacy", locale)}
            className="text-ink-50 underline underline-offset-2 hover:text-brand"
          >
            {t("cookies.learnMore")}
          </Link>
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" variant="brand" onClick={() => decide("granted")}>
            {t("cookies.accept")}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => decide("denied")}>
            {t("cookies.decline")}
          </Button>
        </div>
      </div>
    </div>
  );
};
