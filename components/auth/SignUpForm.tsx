"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthDivider, AuthInput } from "@/components/auth/AuthInput";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { GmailIcon, MailIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";
import { executeRecaptcha } from "@/lib/captcha/client";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";

/** Inbox deep-link for the most common providers. Gmail's `/mail/u/0/#inbox`
 * opens the default account straight in the inbox tab; for everything else we
 * just send them to Gmail's root — Gmail itself redirects to the logged-in
 * account, so the worst case is "land on Gmail, look for the message". */
const inboxUrlFor = (email: string): string => {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return "https://mail.google.com/mail/u/0/#inbox";
  }
  return "https://mail.google.com/";
};

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
        setError(authErrorMessage(t, res.error));
        return;
      }
      // Better Auth's `requireEmailVerification` blocks sign-in; show the check-inbox state instead of routing home.
      setPendingEmail(email);
    } catch (err) {
      setError(
        err instanceof Error && /network|fetch|offline/i.test(err.message)
          ? t("auth.errorNetwork")
          : t("auth.errorGeneric"),
      );
    } finally {
      setLoading(false);
    }
  };

  if (pendingEmail) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
          <MailIcon size={26} />
        </div>

        <p
          role="status"
          className="mx-auto mt-5 max-w-sm text-base font-medium text-balance text-ink-50"
        >
          {t("auth.signUpCheckEmail")}
        </p>

        <p className="mt-3 inline-flex items-center rounded-full border border-ink-600 bg-ink-800/70 px-3 py-1 font-mono text-sm text-ink-200">
          {pendingEmail}
        </p>

        <a
          href={inboxUrlFor(pendingEmail)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-field border border-ink-600 bg-ink-800 px-4 py-2.5 text-sm font-semibold text-ink-50 transition-colors hover:bg-ink-700"
        >
          <GmailIcon size={16} />
          {t("auth.openInbox")}
        </a>

        <p className="mx-auto mt-4 max-w-sm text-xs text-pretty text-ink-400">
          {t("auth.checkSpam")}
        </p>

        <div className="mt-6 border-t border-ink-700 pt-5">
          <Link
            href={routePath("signIn", locale)}
            className="text-sm font-medium text-accent hover:underline"
          >
            {t("auth.backToSignIn")}
          </Link>
        </div>

        <p className="mx-auto mt-4 max-w-sm text-[11px] leading-relaxed text-ink-500">
          {t("auth.recaptchaNotice")}
        </p>
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
