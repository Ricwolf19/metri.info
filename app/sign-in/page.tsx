import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { createT } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

const SignInPage = () => {
  const t = createT("en");
  return (
    <AuthShell
      locale="en"
      title={t("auth.signInTitle")}
      subtitle={t("auth.signInSubtitle")}
    >
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
};

export default SignInPage;
