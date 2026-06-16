import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createT } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Elige una nueva contraseña",
  robots: { index: false },
};

const RestablecerContrasenaPage = () => {
  const t = createT("es");
  return (
    <AuthShell
      locale="es"
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSubtitle")}
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
};

export default RestablecerContrasenaPage;
