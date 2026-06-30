import type { Metadata } from "next";

import { ActivityView } from "@/components/account/ActivityView";
import { requireUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Mi actividad · Metri",
  robots: { index: false, follow: false },
};

const ActividadPage = async (props: {
  searchParams: Promise<{ historyPage?: string }>;
}) => {
  const user = await requireUser();
  const { historyPage } = await props.searchParams;
  const page = Number(historyPage) || 1;

  return <ActivityView userId={user.id} locale="es" page={page} />;
};

export default ActividadPage;
