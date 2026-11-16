"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { AuthInput } from "@/components/auth/AuthInput";
import { FormError } from "@/components/auth/FormError";
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

  // A rule a field broke is shown on that field; a server error stays below.
  // Checked on submit only, like before: no red text while still typing.
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { password: "", confirm: "" } });

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

  const onSubmit = handleSubmit(async ({ password }) => {
    try {
      const res = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (res.error) {
        // Mapped, never `res.error.message`: that is English on /es.
        setError("root.server", { message: authErrorMessage(t, res.error) });
        return;
      }
      track("password_reset_completed");
      router.push(`${signIn}?reset=1`);
      router.refresh();
    } catch {
      setError("root.server", { message: t("auth.errorGeneric") });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthInput
        label={t("auth.newPassword")}
        type="password"
        autoComplete="new-password"
        required
        hint={t("auth.passwordHint")}
        error={errors.password?.message}
        {...register("password", {
          minLength: {
            value: MIN_PASSWORD,
            message: t("auth.errorPasswordShort"),
          },
        })}
      />
      <AuthInput
        label={t("auth.confirmPassword")}
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirm?.message}
        {...register("confirm", {
          validate: (confirm, { password }) =>
            confirm === password || t("auth.errorPasswordMatch"),
        })}
      />
      <FormError message={errors.root?.server?.message} />
      <Button type="submit" loading={isSubmitting} className="w-full">
        {isSubmitting ? t("common.loading") : t("auth.resetSubmit")}
      </Button>
    </form>
  );
};
