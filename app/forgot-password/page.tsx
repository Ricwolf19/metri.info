import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { createT } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false },
};

const ForgotPasswordPage = () => {
  const t = createT("en");
  return (
    <AuthShell
      locale="en"
      title={t("auth.forgotTitle")}
      subtitle={t("auth.forgotSubtitle")}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
};

export default ForgotPasswordPage;
