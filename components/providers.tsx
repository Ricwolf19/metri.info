"use client";

import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme/theme-context";

/** Client provider tree. Theme + locale self-initialize on the client (theme
 * from storage, locale from the URL) so the root layout stays static. */
export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <I18nProvider>{children}</I18nProvider>
  </ThemeProvider>
);
