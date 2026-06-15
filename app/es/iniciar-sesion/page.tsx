import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { createT } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false },
};

const IniciarSesionPage = () => {
  const t = createT("es");
  return (
    <AuthShell
      locale="es"
      title={t("auth.signInTitle")}
      subtitle={t("auth.signInSubtitle")}
    >
      <SignInForm />
    </AuthShell>
  );
};

export default IniciarSesionPage;
