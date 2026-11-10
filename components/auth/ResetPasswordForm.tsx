"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";

const MIN_PASSWORD = 8;

/** Sets a new password from a reset link. The `token` arrives as a query param
 * (Better Auth redirects `/reset-password/:token` → `redirectTo?token=…`, or
 * `?error=INVALID_TOKEN` for a bad/expired link). */
export const ResetPasswordForm = () => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const signIn = routePath("signIn", locale);
  const forgot = routePath("forgotPassword", locale);

  const token = params.get("token");
  const tokenError = params.get("error");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  // A rule a field broke is shown on that field; a server error stays below.
  const [errorField, setErrorField] = useState<"password" | "confirm" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  if (tokenError || !token) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-sm font-medium text-red-500">
          {t("auth.resetInvalidToken")}
        </p>
        <Link
          href={forgot}
          className="inline-block text-sm font-medium text-accent hover:underline"
        >
          {t("auth.forgotTitle")}
        </Link>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorField(null);
    if (password.length < MIN_PASSWORD) {
      setError(t("auth.errorPasswordShort"));
      setErrorField("password");
      return;
    }
    if (password !== confirm) {
      setError(t("auth.errorPasswordMatch"));
      setErrorField("confirm");
      return;
    }
    setLoading(true);
    try {
      const res = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (res.error) {
        // Mapped, never `res.error.message`: that is English on /es.
        setError(authErrorMessage(t, res.error));
        return;
      }
      track("password_reset_completed");
      router.push(`${signIn}?reset=1`);
      router.refresh();
    } catch {
      setError(t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthInput
        label={t("auth.newPassword")}
        type="password"
        autoComplete="new-password"
        required
        hint={t("auth.passwordHint")}
        error={errorField === "password" ? error : null}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <AuthInput
        label={t("auth.confirmPassword")}
        type="password"
        autoComplete="new-password"
        required
        error={errorField === "confirm" ? error : null}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {error && !errorField && (
        <p role="alert" className="text-sm font-medium text-red-500">
          {error}
        </p>
      )}
      <Button type="submit" loading={loading} className="w-full">
        {loading ? t("common.loading") : t("auth.resetSubmit")}
      </Button>
    </form>
  );
};
