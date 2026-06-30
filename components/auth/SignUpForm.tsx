"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthDivider, AuthInput } from "@/components/auth/AuthInput";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { executeRecaptcha } from "@/lib/captcha/client";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";

export const SignUpForm = () => {
  const { t, locale } = useI18n();
  const home = routePath("home", locale);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Returns null when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is unset, so local dev still works.
      const captchaToken = await executeRecaptcha("signup");

      const res = await authClient.signUp.email(
        { name, email, password },
        {
          headers: captchaToken ? { "x-recaptcha-token": captchaToken } : {},
        },
      );
      if (res.error) {
        const code = (res.error as { code?: string }).code ?? "";
        if (
          code === "captcha_failed" ||
          /captcha|bot/i.test(res.error.message ?? "")
        ) {
          setError(t("auth.errorBot"));
          return;
        }
        setError(res.error.message ?? t("auth.errorGeneric"));
        return;
      }
      // Better Auth's `requireEmailVerification` blocks sign-in; show the check-inbox state instead of routing home.
      setPendingEmail(email);
    } catch {
      setError(t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  if (pendingEmail) {
    return (
      <div className="space-y-4 text-center">
        <p
          role="status"
          className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-medium text-accent"
        >
          {t("auth.signUpCheckEmail")}
        </p>
        <p className="text-sm text-ink-300">{pendingEmail}</p>
        <p className="text-xs text-ink-400">{t("auth.recaptchaNotice")}</p>
        <Link
          href={routePath("signIn", locale)}
          className="inline-block text-sm font-medium text-accent hover:underline"
        >
          {t("auth.backToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SocialButtons callbackURL={home} />
      <AuthDivider label={t("auth.or")} />

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label={t("auth.name")}
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <AuthInput
          label={t("auth.email")}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          label={t("auth.password")}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm font-medium text-red-500">
            {error}
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          {loading ? t("common.loading") : t("auth.signUp")}
        </Button>
      </form>

      <p className="space-y-2 text-center text-sm text-ink-300">
        <span className="block text-xs text-ink-400">
          {t("auth.recaptchaNotice")}
        </span>
        <span>
          {t("auth.haveAccount")}{" "}
          <Link
            href={routePath("signIn", locale)}
            className="font-medium text-accent hover:underline"
          >
            {t("auth.signIn")}
          </Link>
        </span>
      </p>
    </div>
  );
};
