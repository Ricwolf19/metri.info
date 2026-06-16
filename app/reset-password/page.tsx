import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createT } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
};

const ResetPasswordPage = () => {
  const t = createT("en");
  return (
    <AuthShell
      locale="en"
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSubtitle")}
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
};

export default ResetPasswordPage;
