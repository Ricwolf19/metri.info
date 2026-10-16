"use client";

import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { ToastProvider } from "@/components/ui/toast";
import { I18nProvider, useT } from "@/lib/i18n";

/** Toasts live inside I18nProvider so the close label can be localized. */
const LocalizedToastProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const t = useT();
  return (
    <ToastProvider closeLabel={t("toast.dismiss")}>{children}</ToastProvider>
  );
};

/** Client provider tree. The locale self-initializes on the client (from the
 * URL) so the root layout stays static. PostHog is a no-op when
 * NEXT_PUBLIC_POSTHOG_KEY is absent. */
export const Providers = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider>
    <LocalizedToastProvider>
      <PostHogProvider>{children}</PostHogProvider>
    </LocalizedToastProvider>
  </I18nProvider>
);
