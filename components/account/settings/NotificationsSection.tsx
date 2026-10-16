"use client";

import { useState, useTransition } from "react";

import { SettingsPanel } from "@/components/account/settings/SettingsPanel";
import { BellIcon, BellOffIcon, SmartphoneIcon } from "@/components/icons";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics/track";
import { setReleaseEmails } from "@/app/account/settings/actions";
import { useT } from "@/lib/i18n";

/**
 * Notifications panel. The only account-level notification Metri sends is the
 * release email, so that is the one switch — it saves on toggle, optimistic,
 * and is the same flag the app's profile switch and the email's unsubscribe
 * link write. Push reminders are configured on the device and never leave it,
 * which the panel says plainly instead of offering a switch that does nothing.
 */
export const NotificationsSection = ({
  id,
  initialReleaseEmails,
}: {
  id: string;
  initialReleaseEmails: boolean;
}) => {
  const t = useT();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(initialReleaseEmails);
  const [pending, startTransition] = useTransition();

  const onToggle = (next: boolean) => {
    setEnabled(next);
    startTransition(async () => {
      const res = await setReleaseEmails(next);
      if (!res.ok) {
        setEnabled(!next);
        toast({ title: t("toast.genericError"), variant: "error" });
        return;
      }
      track("release_emails_toggled", { enabled: next });
      toast({
        title: next
          ? t("notifications.releaseOnToast")
          : t("notifications.releaseOffToast"),
        variant: "success",
      });
    });
  };

  return (
    <SettingsPanel
      id={id}
      title={t("notifications.title")}
      description={t("notifications.desc")}
      footer={
        <p className="mr-auto text-xs text-ink-400">
          {t("notifications.savedAutomatically")}
        </p>
      }
    >
      <div className="space-y-4">
        <label className="flex cursor-pointer items-center gap-4 rounded-card border border-ink-600 bg-ink-900/40 p-4 transition-colors hover:border-ink-500">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-ink-700 text-brand">
            {enabled ? <BellIcon size={18} /> : <BellOffIcon size={18} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-ink-50">
              {t("notifications.releaseTitle")}
            </span>
            <span className="mt-0.5 block text-sm text-ink-300">
              {t("notifications.releaseDesc")}
            </span>
          </span>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={pending}
            aria-label={t("notifications.releaseTitle")}
          />
        </label>

        <div className="flex items-start gap-3 rounded-field border border-ink-600/70 bg-ink-850 px-4 py-3 text-sm text-ink-300">
          <SmartphoneIcon size={18} className="mt-0.5 shrink-0 text-ink-400" />
          <p>{t("notifications.pushNote")}</p>
        </div>
      </div>
    </SettingsPanel>
  );
};
