"use client";

import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme/theme-context";

/** Client provider tree. Theme + locale self-initialize on the client (theme
 * from storage, locale from the URL) so the root layout stays static. PostHog
 * is a no-op when NEXT_PUBLIC_POSTHOG_KEY is absent. */
export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <I18nProvider>
      <PostHogProvider>{children}</PostHogProvider>
    </I18nProvider>
  </ThemeProvider>
);
