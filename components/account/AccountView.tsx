import Link from "next/link";

import { AccountIdentity } from "@/components/account/AccountIdentity";
import { ConnectionsSection } from "@/components/account/settings/ConnectionsSection";
import { ProfileSection } from "@/components/account/settings/ProfileSection";
import { SecuritySection } from "@/components/account/settings/SecuritySection";
import { SettingsNav } from "@/components/account/settings/SettingsNav";
import { ArrowRightIcon, StarIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { buttonVariants } from "@/components/ui/button";
import { hasPassword } from "@/lib/account/providers";
import type { AccountProfile } from "@/lib/account/settings";
import type { AccountStats } from "@/lib/account/stats";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

type AccountUser = {
  name: string;
  email: string;
  image?: string | null;
  createdAt?: Date | string | null;
};

/** "My account" — identity + level header, a link out to Activity, and the
 * profile/security/connections settings. Shared by /account and /es/cuenta. */
export const AccountView = ({
  user,
  profile,
  providerIds,
  stats,
  locale,
}: {
  user: AccountUser;
  profile: AccountProfile | null;
  providerIds: string[];
  stats: AccountStats;
  locale: Locale;
}) => {
  const t = createT(locale);
  const userHasPassword = hasPassword(providerIds);

  return (
    <Container className="py-16 sm:py-20">
      <AccountIdentity
        name={user.name}
        email={user.email}
        image={user.image}
        createdAt={user.createdAt}
        stats={stats}
        locale={locale}
      />

      <div className="mt-5">
        <Link
          href={routePath("activity", locale)}
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          <StarIcon size={16} />
          {t("account.activityLink")}
          <ArrowRightIcon size={16} />
        </Link>
      </div>

      <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start">
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
