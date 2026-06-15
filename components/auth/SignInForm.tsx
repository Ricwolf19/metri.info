"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthDivider, AuthInput } from "@/components/auth/AuthInput";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { authClient } from "@/lib/auth/client";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";

export const SignInForm = () => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const home = routePath("home", locale);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await authClient.signIn.email({ email, password });
    if (res.error) {
      setError(res.error.message ?? t("auth.errorGeneric"));
      setLoading(false);
      return;
    }
    router.push(home);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <SocialButtons callbackURL={home} />
      <AuthDivider label={t("auth.or")} />

      <form onSubmit={onSubmit} className="space-y-4">
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm font-medium text-red-500">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-ink-50 font-semibold text-ink-900 transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? t("common.loading") : t("auth.signIn")}
        </button>
      </form>

      <p className="text-center text-sm text-ink-300">
        {t("auth.noAccount")}{" "}
        <Link
          href={routePath("signUp", locale)}
          className="font-medium text-accent hover:underline"
        >
          {t("auth.createAccount")}
        </Link>
      </p>
    </div>
  );
};
