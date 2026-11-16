"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { AuthDivider, AuthInput } from "@/components/auth/AuthInput";
import { FormError } from "@/components/auth/FormError";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage, thrownAuthError } from "@/lib/auth/errors";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";

export const SignInForm = () => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const home = routePath("home", locale);
  const justReset = params.get("reset") === "1";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", password: "" } });
  const error = errors.root?.server?.message ?? null;

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        setError("root.server", { message: authErrorMessage(t, res.error) });
        return;
      }
      track("login_completed", { method: "email" });
      router.push(home);
      router.refresh();
    } catch (err) {
      setError("root.server", { message: thrownAuthError(t, err) });
    }
  });

  return (
    <div className="space-y-5">
      {justReset && (
        <p
          role="status"
          className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-center text-sm font-medium text-accent"
        >
          {t("auth.resetSuccess")}
        </p>
      )}
      <SocialButtons callbackURL={home} />
      <AuthDivider label={t("auth.or")} />

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label={t("auth.email")}
          type="email"
          autoComplete="email"
          required
          {...register("email", { required: true })}
        />
        <div>
          <AuthInput
            label={t("auth.password")}
            type="password"
            autoComplete="current-password"
            required
            {...register("password", { required: true })}
          />
          <div className="mt-1.5 text-right">
            <Link
              href={routePath("forgotPassword", locale)}
              className="text-xs font-medium text-ink-300 hover:text-accent"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
        </div>
        <FormError message={error} />
        <Button type="submit" loading={isSubmitting} className="w-full">
          {isSubmitting ? t("common.loading") : t("auth.signIn")}
        </Button>
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
