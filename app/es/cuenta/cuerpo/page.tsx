import type { Metadata } from "next";

import { BodyView } from "@/components/body/BodyView";
import { getUserProfile } from "@/lib/account/settings";
import { requireUser } from "@/lib/auth/admin";
import { parseWindow } from "@/lib/body/windows";

export const metadata: Metadata = {
  title: "Mapa corporal y de entreno · Metri",
  robots: { index: false, follow: false },
};

const CuerpoPage = async (props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const user = await requireUser();
  const [profile, { w }] = await Promise.all([
    getUserProfile(user.id),
    props.searchParams,
  ]);
  return (
    <BodyView
      userId={user.id}
      plan={(user as { plan?: string | null }).plan}
      sex={profile?.sex}
      imperial={profile?.unitsPreference === "lb"}
      locale="es"
      windowDays={parseWindow(w)}
    />
  );
};

export default CuerpoPage;
