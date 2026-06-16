"use client";

import { useState } from "react";

import {
  PanelStatus,
  SettingsPanel,
} from "@/components/account/settings/SettingsPanel";
import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { setAccountPassword } from "@/app/account/settings/actions";
import { track } from "@/lib/analytics/track";
import { authClient } from "@/lib/auth/client";
import { useT } from "@/lib/i18n";

const MIN_PASSWORD = 8;

type Status = { tone: "success" | "error"; message: string } | null;

/** Change-password (has credential) or set-password (OAuth-only) form. */
export const SecuritySection = ({
  id,
  hasPassword,
}: {
  id: string;
  hasPassword: boolean;
}) => {
  const t = useT();
  const { toast } = useToast();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const validate = (): string | null => {
    if (next.length < MIN_PASSWORD) return t("settings.errorPasswordShort");
    if (next !== confirm) return t("settings.errorPasswordMatch");
    return null;
  };

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const invalid = validate();
    if (invalid) {
      setStatus({ tone: "error", message: invalid });
      return;
    }
    setPending(true);
    try {
      if (hasPassword) {
        const res = await authClient.changePassword({
          currentPassword: current,
          newPassword: next,
          revokeOtherSessions: true,
        });
        if (res.error) {
          const message =
            res.error.message ?? t("settings.errorCurrentPassword");
          setStatus({ tone: "error", message });
          toast({
            title: t("toast.passwordError"),
            description: message,
            variant: "error",
          });
          return;
        }
        reset();
        setStatus({ tone: "success", message: t("settings.passwordSaved") });
        track("password_changed", { mode: "change" });
        toast({ title: t("toast.passwordChanged"), variant: "success" });
      } else {
        const res = await setAccountPassword(next);
        if (!res.ok) {
          setStatus({ tone: "error", message: res.error.message });
          toast({
            title: t("toast.passwordError"),
            description: res.error.message,
            variant: "error",
          });
          return;
        }
        reset();
        setStatus({
          tone: "success",
          message:
            res.data.method === "email"
              ? t("settings.setPasswordEmailFallback")
              : t("settings.passwordSet"),
        });
        track("password_changed", { mode: "set" });
        toast({ title: t("toast.passwordSet"), variant: "success" });
      }
    } catch {
      setStatus({ tone: "error", message: t("settings.errorGeneric") });
      toast({ title: t("toast.genericError"), variant: "error" });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <SettingsPanel
        id={id}
        title={t("settings.securityTitle")}
        description={
          hasPassword
            ? t("settings.securityDesc")
            : t("settings.setPasswordDesc")
        }
        footer={
          <>
            <PanelStatus
              message={status?.message ?? null}
              tone={status?.tone ?? "success"}
            />
            <Button type="submit" size="sm" loading={pending}>
              {pending
                ? t("settings.saving")
                : hasPassword
                  ? t("settings.changePassword")
                  : t("settings.setPassword")}
            </Button>
          </>
        }
      >
        <div className="max-w-md space-y-4">
          {hasPassword && (
            <AuthInput
              label={t("settings.currentPassword")}
              type="password"
              autoComplete="current-password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          )}
          <AuthInput
            label={t("settings.newPassword")}
            type="password"
            autoComplete="new-password"
            required
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <AuthInput
            label={t("settings.confirmPassword")}
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </SettingsPanel>
    </form>
  );
};
