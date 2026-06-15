import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { createT } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false },
};

const RegistrarsePage = () => {
  const t = createT("es");
  return (
    <AuthShell
      locale="es"
      title={t("auth.signUpTitle")}
      subtitle={t("auth.signUpSubtitle")}
    >
      <SignUpForm />
    </AuthShell>
  );
};

export default RegistrarsePage;
