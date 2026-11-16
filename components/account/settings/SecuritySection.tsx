"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

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
import { authErrorMessage } from "@/lib/auth/errors";
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { current: "", next: "", confirm: "" } });
  const [status, setStatus] = useState<Status>(null);

  // The rules a field breaks show on that field, on submit; the server's
  // answer goes to the panel status.
  const onSubmit = handleSubmit(async ({ current, next }) => {
    setStatus(null);
    try {
      if (hasPassword) {
        const res = await authClient.changePassword({
          currentPassword: current,
          newPassword: next,
          revokeOtherSessions: true,
        });
        if (res.error) {
          const message =
            // Mapped, never `res.error.message` (English on /es).
            res.error.code === "INVALID_PASSWORD"
              ? t("settings.errorCurrentPassword")
              : authErrorMessage(t, res.error);
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
    }
  });

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
            <Button type="submit" size="sm" loading={isSubmitting}>
              {isSubmitting
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
              {...register("current", { required: hasPassword })}
            />
          )}
          <AuthInput
            label={t("settings.newPassword")}
            type="password"
            autoComplete="new-password"
            required
            hint={t("auth.passwordHint")}
            error={errors.next?.message}
            {...register("next", {
              minLength: {
                value: MIN_PASSWORD,
                message: t("settings.errorPasswordShort"),
              },
            })}
          />
          <AuthInput
            label={t("settings.confirmPassword")}
            type="password"
            autoComplete="new-password"
            required
            error={errors.confirm?.message}
            {...register("confirm", {
              validate: (confirm, { next }) =>
                confirm === next || t("settings.errorPasswordMatch"),
            })}
          />
        </div>
      </SettingsPanel>
    </form>
  );
};
