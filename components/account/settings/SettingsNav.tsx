"use client";

import { BellIcon, LinkIcon, LockIcon, ProfileIcon } from "@/components/icons";
import { SideNav } from "@/components/ui/SideNav";
import { useT } from "@/lib/i18n";

/** Settings rail — the shared `SideNav` in anchor mode, so the active item
 * follows the panel in view and the pill glides between sections. */
export const SettingsNav = () => {
  const t = useT();
  return (
    <SideNav
      mode="anchor"
      ariaLabel={t("account.settingsTitle")}
      className="w-full shrink-0 lg:sticky lg:top-24 lg:w-60 lg:self-start"
      groups={[
        {
          items: [
            {
              id: "profile",
              href: "#profile",
              label: t("settings.navProfile"),
              description: t("settings.navProfileDesc"),
              icon: ProfileIcon,
            },
            {
              id: "notifications",
              href: "#notifications",
              label: t("settings.navNotifications"),
              description: t("settings.navNotificationsDesc"),
              icon: BellIcon,
            },
            {
              id: "security",
              href: "#security",
              label: t("settings.navSecurity"),
              description: t("settings.navSecurityDesc"),
              icon: LockIcon,
            },
            {
              id: "connections",
              href: "#connections",
              label: t("settings.navConnections"),
              description: t("settings.navConnectionsDesc"),
              icon: LinkIcon,
            },
          ],
        },
      ]}
    />
  );
};
