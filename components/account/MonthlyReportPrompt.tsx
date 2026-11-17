"use client";

import { useState, useTransition } from "react";

import { setMonthlyReportEmails } from "@/app/account/settings/actions";
import { MailIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics/track";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The one-time ask for the monthly email. It can carry body data, so it stays
 * off until the account says yes. Either answer is stored, which is what makes
 * this appear once; the switch under Notifications changes it later.
 */
export const MonthlyReportPrompt = ({ className }: { className?: string }) => {
  const t = useT();
  const { toast } = useToast();
  const [answered, setAnswered] = useState(false);
  const [pending, startTransition] = useTransition();
  // Which button was pressed, so only that one shows the spinner.
  const [choice, setChoice] = useState<boolean | null>(null);

  if (answered) return null;

  const answer = (enabled: boolean) => {
    setChoice(enabled);
    startTransition(async () => {
      const res = await setMonthlyReportEmails(enabled);
      if (!res.ok) {
        toast({ title: t("toast.genericError"), variant: "error" });
        return;
      }
      track("monthly_emails_toggled", { enabled, via: "prompt" });
      setAnswered(true);
      if (enabled)
        toast({ title: t("notifications.monthlyOnToast"), variant: "success" });
    });
  };

  return (
    <div
      className={cn(
        "rounded-card border border-brand/30 bg-brand/10 p-4 sm:p-5 print:hidden",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-ink-800 text-brand">
          <MailIcon size={18} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-ink-50">
            {t("monthlyPrompt.title")}
          </p>
          <p className="mt-1 max-w-2xl text-sm text-ink-300">
            {t("monthlyPrompt.body")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="brand"
              disabled={pending}
              loading={pending && choice === true}
              onClick={() => answer(true)}
            >
              {t("monthlyPrompt.accept")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              loading={pending && choice === false}
              onClick={() => answer(false)}
            >
              {t("monthlyPrompt.decline")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
