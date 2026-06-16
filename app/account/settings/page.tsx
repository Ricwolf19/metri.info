import Link from "next/link";
import type { Metadata } from "next";

import { ConnectionsSection } from "@/components/account/settings/ConnectionsSection";
import { ProfileSection } from "@/components/account/settings/ProfileSection";
import { SecuritySection } from "@/components/account/settings/SecuritySection";
import { SettingsNav } from "@/components/account/settings/SettingsNav";
import { ArrowLeftIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/Section";
import { hasPassword } from "@/lib/account/providers";
import { getUserProfile, getUserProviderIds } from "@/lib/account/settings";
import { requireUser } from "@/lib/auth/admin";
import { createT } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Settings · Metri",
  robots: { index: false, follow: false },
};

const AccountSettingsPage = async () => {
  const user = await requireUser();
  const t = createT("en");

  const [profile, providerIds] = await Promise.all([
    getUserProfile(user.id),
    getUserProviderIds(user.id),
  ]);
  const userHasPassword = hasPassword(providerIds);

  return (
    <Container className="py-16 sm:py-20">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-300 transition-colors hover:text-accent"
      >
        <ArrowLeftIcon size={16} />
        {t("account.backToAccount")}
      </Link>

      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        align="left"
        className="mb-10"
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <SettingsNav />
        <div className="min-w-0 flex-1 space-y-6">
          <ProfileSection
            id="profile"
            initialName={user.name}
            profile={profile}
          />
          <SecuritySection id="security" hasPassword={userHasPassword} />
          <ConnectionsSection
            id="connections"
            providerIds={providerIds}
            hasPassword={userHasPassword}
          />
        </div>
      </div>
    </Container>
  );
};

export default AccountSettingsPage;
