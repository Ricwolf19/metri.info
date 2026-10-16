"use client";

import { SideNav, type SideNavGroup } from "@/components/ui/SideNav";
import type { DocCategory, DocMeta } from "@/lib/docs";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";

type CategoryInfo = { category: DocCategory; labelKey: TranslationKey };

/** Docs category tree on the shared `SideNav`: one group per category, the
 * current article lit by exact pathname match. */
export const DocsSidebar = ({
  docs,
  categories,
  basePath,
  onNavigate,
}: {
  docs: DocMeta[];
  categories: CategoryInfo[];
  basePath: string;
  onNavigate?: () => void;
}) => {
  const t = useT();
  const groups: SideNavGroup[] = categories
    .map(({ category, labelKey }) => ({
      label: t(labelKey),
      items: docs
        .filter((d) => d.category === category)
        .map((doc) => ({
          id: doc.slug,
          href: `${basePath}/${doc.slug}`,
          label: doc.title,
          exact: true,
        })),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <SideNav
      groups={groups}
      mode="route"
      layout="vertical"
      ariaLabel={t("nav.docs")}
      onNavigate={onNavigate}
    />
  );
};
