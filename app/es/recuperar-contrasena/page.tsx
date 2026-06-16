import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { createT } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  robots: { index: false },
};

const RecuperarContrasenaPage = () => {
  const t = createT("es");
  return (
    <AuthShell
      locale="es"
      title={t("auth.forgotTitle")}
      subtitle={t("auth.forgotSubtitle")}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
};

export default RecuperarContrasenaPage;
