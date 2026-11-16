"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";

import { AuthInput } from "@/components/auth/AuthInput";
import { FormError } from "@/components/auth/FormError";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage, thrownAuthError } from "@/lib/auth/errors";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { focusOnMount } from "@/lib/utils";

/** Requests a password-reset email. Always shows the same neutral confirmation
 * (whether or not the email exists) to avoid leaking which addresses have an
 * account. The reset link Better Auth emails points at `/reset-password`. */
export const ForgotPasswordForm = () => {
  const { t, locale } = useI18n();
  const signIn = routePath("signIn", locale);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({ defaultValues: { email: "" } });
  const error = errors.root?.server?.message ?? null;

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      const res = await authClient.requestPasswordReset({
        email,
        redirectTo: routePath("resetPassword", locale),
      });
      if (res?.error && !/user.*not.*found/i.test(res.error.message ?? "")) {
        // Better Auth returns "User not found" for unknown emails; per the
        // design we always show the neutral confirmation, so ignore that path
        // and surface anything else.
        setError("root.server", { message: authErrorMessage(t, res.error) });
        return;
      }
      track("password_reset_requested");
    } catch (err) {
      setError("root.server", { message: thrownAuthError(t, err) });
    }
  });

  // A submit that set no error is a sent email (RHF counts a handler that
  // called `setError` as unsuccessful).
  if (isSubmitSuccessful) {
    return (
      <div className="space-y-5 text-center">
        <p
          ref={focusOnMount}
          role="status"
          tabIndex={-1}
          className="text-sm text-ink-200 focus:outline-none"
        >
          {t("auth.forgotSent")}
        </p>
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
      <FormError message={error} />
      <AuthInput
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        required
        {...register("email", { required: true })}
      />
      <Button type="submit" loading={isSubmitting} className="w-full">
        {isSubmitting ? t("common.loading") : t("auth.forgotSubmit")}
      </Button>
      <p className="text-center text-sm text-ink-300">
        <Link href={signIn} className="font-medium text-accent hover:underline">
          {t("auth.backToSignIn")}
        </Link>
      </p>
    </form>
  );
};
