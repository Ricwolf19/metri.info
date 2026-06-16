"use client";

import { LinkIcon, LockIcon, ProfileIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";

const SECTIONS = [
  {
    id: "profile",
    labelKey: "settings.navProfile",
    descKey: "settings.navProfileDesc",
    Icon: ProfileIcon,
  },
  {
    id: "security",
    labelKey: "settings.navSecurity",
    descKey: "settings.navSecurityDesc",
    Icon: LockIcon,
  },
  {
    id: "connections",
    labelKey: "settings.navConnections",
    descKey: "settings.navConnectionsDesc",
    Icon: LinkIcon,
  },
] as const;

/** Left step-rail (adapted from the reference WizardLayout nav). Anchors jump to
 * each panel; on mobile it scrolls horizontally above the panels. */
export const SettingsNav = () => {
  const t = useT();
  return (
    <nav className="flex w-full shrink-0 gap-1 overflow-x-auto lg:w-60 lg:flex-col lg:overflow-visible">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="group flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left text-ink-300 transition-colors hover:border-ink-600 hover:bg-ink-800 hover:text-ink-50"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-ink-200 group-hover:text-accent">
            <s.Icon size={16} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {t(s.labelKey)}
            </span>
            <span className="truncate text-xs text-ink-500">
              {t(s.descKey)}
            </span>
          </span>
        </a>
      ))}
    </nav>
  );
};
