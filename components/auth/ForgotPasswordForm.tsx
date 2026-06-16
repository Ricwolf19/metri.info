"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { authClient } from "@/lib/auth/client";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";

/** Requests a password-reset email. Always shows the same neutral confirmation
 * (whether or not the email exists) to avoid leaking which addresses have an
 * account. The reset link Better Auth emails points at `/reset-password`. */
export const ForgotPasswordForm = () => {
  const { t, locale } = useI18n();
  const signIn = routePath("signIn", locale);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: routePath("resetPassword", locale),
      });
      track("password_reset_requested");
    } catch {
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-sm text-ink-200">{t("auth.forgotSent")}</p>
        <Link
          href={signIn}
          className="inline-block text-sm font-medium text-accent hover:underline"
        >
          {t("auth.backToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthInput
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" loading={loading} className="w-full">
        {loading ? t("common.loading") : t("auth.forgotSubmit")}
      </Button>
      <p className="text-center text-sm text-ink-300">
        <Link href={signIn} className="font-medium text-accent hover:underline">
          {t("auth.backToSignIn")}
        </Link>
      </p>
    </form>
  );
};
