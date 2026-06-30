import type { Metadata } from "next";

import { AccountView } from "@/components/account/AccountView";
import { getUserProfile, getUserProviderIds } from "@/lib/account/settings";
import { getAccountStats } from "@/lib/account/stats";
import { requireUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Mi cuenta · Metri",
  robots: { index: false, follow: false },
};

const CuentaPage = async () => {
  const user = await requireUser();
  const [profile, providerIds, stats] = await Promise.all([
    getUserProfile(user.id),
    getUserProviderIds(user.id),
    getAccountStats(user.id),
  ]);

  return (
    <AccountView
      user={user}
      profile={profile}
      providerIds={providerIds}
      stats={stats}
      locale="es"
    />
  );
};

export default CuentaPage;
