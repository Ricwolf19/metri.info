"use client";

import { useId, useState, useTransition } from "react";

import { SettingsPanel } from "@/components/account/settings/SettingsPanel";
import { BellIcon, BellOffIcon, SmartphoneIcon } from "@/components/icons";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics/track";
import {
  setMonthlyReportEmails,
  setReleaseEmails,
} from "@/app/account/settings/actions";
import { useT } from "@/lib/i18n";
import type { Result } from "@/lib/result";

/** One email switch: saves on toggle, optimistic, rolled back on failure. */
const EmailSwitch = ({
  title,
  description,
  initial,
  save,
  event,
  onToast,
  offToast,
}: {
  title: string;
  description: string;
  initial: boolean;
  save: (enabled: boolean) => Promise<Result<unknown>>;
  event: string;
  onToast: string;
  offToast: string;
}) => {
  const t = useT();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(initial);
  const [pending, startTransition] = useTransition();
  const descriptionId = useId();

  const onToggle = (next: boolean) => {
    setEnabled(next);
    startTransition(async () => {
      const res = await save(next);
      if (!res.ok) {
        setEnabled(!next);
        toast({ title: t("toast.genericError"), variant: "error" });
        return;
      }
      track(event, { enabled: next });
      toast({ title: next ? onToast : offToast, variant: "success" });
    });
  };

  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-card border border-ink-600 bg-ink-900/40 p-4 transition-colors hover:border-ink-500/50">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-ink-700 text-brand">
        {enabled ? <BellIcon size={18} /> : <BellOffIcon size={18} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink-50">{title}</span>
        <span id={descriptionId} className="mt-0.5 block text-sm text-ink-300">
          {description}
        </span>
      </span>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={pending}
        aria-label={title}
        aria-describedby={descriptionId}
      />
    </label>
  );
};

/**
 * Notifications panel: the two emails an account can get. The release switch
 * is the same flag the app's profile switch and that email's unsubscribe link
 * write; the monthly one is opt-in. Push reminders are configured on the
 * device and never leave it, which the panel says plainly instead of offering
 * a switch that does nothing.
 */
export const NotificationsSection = ({
  id,
  initialReleaseEmails,
  initialMonthlyReportEmails,
}: {
  id: string;
  initialReleaseEmails: boolean;
  initialMonthlyReportEmails: boolean;
}) => {
  const t = useT();
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
        <EmailSwitch
          title={t("notifications.releaseTitle")}
          description={t("notifications.releaseDesc")}
          initial={initialReleaseEmails}
          save={setReleaseEmails}
          event="release_emails_toggled"
          onToast={t("notifications.releaseOnToast")}
          offToast={t("notifications.releaseOffToast")}
        />
        <EmailSwitch
          title={t("notifications.monthlyTitle")}
          description={t("notifications.monthlyDesc")}
          initial={initialMonthlyReportEmails}
          save={setMonthlyReportEmails}
          event="monthly_emails_toggled"
          onToast={t("notifications.monthlyOnToast")}
          offToast={t("notifications.monthlyOffToast")}
        />

        <div className="flex items-start gap-3 rounded-field border border-ink-600/70 bg-ink-850 px-4 py-3 text-sm text-ink-300">
          <SmartphoneIcon size={18} className="mt-0.5 shrink-0 text-ink-400" />
          <p>{t("notifications.pushNote")}</p>
        </div>
      </div>
    </SettingsPanel>
  );
};
