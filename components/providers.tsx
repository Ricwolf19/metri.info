"use client";

import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider, type ThemePreference } from "@/lib/theme/theme-context";

/** Client provider tree. Theme preference is resolved on the server from a
 * cookie; locale is derived from the URL inside I18nProvider. */
export const Providers = ({
  themePreference,
  children,
}: {
  themePreference: ThemePreference;
  children: React.ReactNode;
}) => (
  <ThemeProvider initialPreference={themePreference}>
    <I18nProvider>{children}</I18nProvider>
  </ThemeProvider>
);
