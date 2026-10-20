import Link from "next/link";

import { AccountIdentity } from "@/components/account/AccountIdentity";
import { ConnectionsSection } from "@/components/account/settings/ConnectionsSection";
import { NotificationsSection } from "@/components/account/settings/NotificationsSection";
import { ProfileSection } from "@/components/account/settings/ProfileSection";
import { SecuritySection } from "@/components/account/settings/SecuritySection";
import { SettingsNav } from "@/components/account/settings/SettingsNav";
import { ArrowRightIcon, ScaleIcon, StarIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { buttonVariants } from "@/components/ui/button";
import { hasPassword } from "@/lib/account/providers";
import type {
  AccountNotificationPrefs,
  AccountProfile,
} from "@/lib/account/settings";
import type { AccountStats } from "@/lib/account/stats";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";

type AccountUser = {
  name: string;
  email: string;
  image?: string | null;
  createdAt?: Date | string | null;
  plan?: string | null;
};

/** "My account" — identity + plan header, a link out to Activity, and the
 * profile / notifications / security / connections settings. Shared by
 * /account and /es/cuenta. */
export const AccountView = ({
  user,
  profile,
  providerIds,
  prefs,
  stats,
  locale,
}: {
  user: AccountUser;
  profile: AccountProfile | null;
  providerIds: string[];
  prefs: AccountNotificationPrefs;
  stats: AccountStats;
  locale: Locale;
}) => {
  const t = createT(locale);
  const userHasPassword = hasPassword(providerIds);

  return (
    <>
      <PageHero
        eyebrow={t("settings.eyebrow")}
        title={t("account.title")}
        subtitle={t("settings.subtitle")}
        align="left"
        compact
      >
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={routePath("activity", locale)}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <StarIcon size={16} />
            {t("account.activityLink")}
            <ArrowRightIcon size={16} />
          </Link>
          <Link
            href={routePath("body", locale)}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ScaleIcon size={16} />
            {t("body.link")}
          </Link>
        </div>
      </PageHero>

      <Container className="py-10 sm:py-14">
        <AccountIdentity
          name={user.name}
          email={user.email}
          image={user.image}
          createdAt={user.createdAt}
          stats={stats}
          locale={locale}
          plan={user.plan}
        />

        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start">
          <SettingsNav />
          <div className="min-w-0 flex-1 space-y-6">
            <ProfileSection
              id="profile"
              initialName={user.name}
              profile={profile}
            />
            <NotificationsSection
              id="notifications"
              initialReleaseEmails={prefs.releaseEmails}
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
    </>
  );
};
