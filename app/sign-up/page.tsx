import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { createT } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false },
};

const SignUpPage = () => {
  const t = createT("en");
  return (
    <AuthShell
      locale="en"
      title={t("auth.signUpTitle")}
      subtitle={t("auth.signUpSubtitle")}
    >
      <SignUpForm />
    </AuthShell>
  );
};

export default SignUpPage;
