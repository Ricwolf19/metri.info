"use client";

import { I18nProvider } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import {
  ThemeProvider,
  type ThemePreference,
} from "@/lib/theme/theme-context";

/** Client provider tree. Initial locale/theme are resolved on the server from
 * cookies and passed in so the first client render matches the SSR markup. */
export const Providers = ({
  locale,
  themePreference,
  children,
}: {
  locale: Locale;
  themePreference: ThemePreference;
  children: React.ReactNode;
}) => (
  <ThemeProvider initialPreference={themePreference}>
    <I18nProvider initialLocale={locale}>{children}</I18nProvider>
  </ThemeProvider>
);
