"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";

import { type Locale, type TFunction, translate } from "./config";

type I18nContextValue = {
  locale: Locale;
  t: TFunction;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Client provider. With path-based i18n the locale is the URL — derived from the
 * pathname so it stays correct across client navigations (e.g. / ↔ /es) without
 * extra state. `<html lang>` is set server-side from the middleware header.
 */
export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const locale: Locale =
    pathname === "/es" || pathname?.startsWith("/es/") ? "es" : "en";

  const value = useMemo<I18nContextValue>(
    () => ({ locale, t: (key, vars) => translate(locale, key, vars) }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>.");
  return ctx;
};

/** Convenience hook when a component only needs the translate function. */
export const useT = (): TFunction => useI18n().t;
