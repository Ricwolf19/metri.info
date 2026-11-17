import type { ComponentType } from "react";

import { CALC_ICONS } from "@/components/calculators/calcIcons";
import {
  BookIcon,
  BookmarkIcon,
  CalculatorIcon,
  CompassIcon,
  DownloadIcon,
  type IconProps,
  InfoIcon,
  MailIcon,
  MedalIcon,
  SmartphoneIcon,
} from "@/components/icons";
import { CALC_GROUPS } from "@/lib/calculators/groups";
import { type DocTitles, FEATURED_DOCS } from "@/lib/docs/featured";
import type { Locale } from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n/en";
import { type CalcRouteId, routePath } from "@/lib/i18n/routes";
import { mobileAppReleases } from "@/lib/site";

/**
 * The public site menu as data, one model for the desktop bar and the phone
 * drawer: four sections, three of them groups that open (Tools, Learn, App)
 * and the roadmap as a direct link, the free entry point. Tools and Learn
 * share a shape: titled columns and a closing "all of them" link, Learn's
 * first column being the recommended start (glossary, knowledge check)
 * before the featured guides. Contact sits in App, next to the download and
 * the changelog; About and GitHub live in the footer and the drawer's chips.
 */

/** Each calculator's name per language, read on the server from the
 * calculator content so that module stays out of the client bundle. */
export type ToolNames = Record<Locale, Record<CalcRouteId, string>>;

export type MenuLink = {
  href: string;
  label: string;
  description?: string;
  icon: ComponentType<IconProps>;
  external?: boolean;
};

export type MenuSection = {
  id: "tools" | "learn" | "roadmap" | "app";
  label: string;
  icon: ComponentType<IconProps>;
  /** A direct link, no menu. */
  href?: string;
  /** Titled columns of links (Tools, Learn) or one plain list (App). A
   * `featured` column is the recommended start, drawn apart. */
  columns: { title?: string; featured?: boolean; links: MenuLink[] }[];
  /** A closing "see everything" link under the columns. */
  more?: Pick<MenuLink, "href" | "label">;
};

type T = (key: TranslationKey) => string;

export const buildSiteNav = (
  t: T,
  locale: Locale,
  toolNames: ToolNames,
  docTitles: DocTitles,
): MenuSection[] => {
  const docs = routePath("docs", locale);
  return [
    {
      id: "tools",
      label: t("nav.tools"),
      icon: CalculatorIcon,
      columns: CALC_GROUPS.map((group) => ({
        title: t(group.key),
        links: group.calcs.map((id) => ({
          href: routePath(id, locale),
          label: toolNames[locale][id],
          icon: CALC_ICONS[id],
        })),
      })),
      more: { href: routePath("tools", locale), label: t("nav.allTools") },
    },
    {
      id: "learn",
      label: t("nav.learn"),
      icon: BookIcon,
      columns: [
        {
          title: t("nav.recommended"),
          featured: true,
          links: [
            {
              href: `${docs}/glossary`,
              label: t("nav.glossary"),
              description: t("nav.glossary.desc"),
              icon: InfoIcon,
            },
            {
              href: routePath("quiz", locale),
              label: t("quiz.title"),
              description: t("nav.quiz.desc"),
              icon: MedalIcon,
            },
          ],
        },
        ...FEATURED_DOCS.map((group) => ({
          title: t(group.key),
          links: group.docs.map((doc) => ({
            href: `${docs}/${doc.slug}`,
            label: docTitles[locale][doc.slug],
            icon: doc.icon,
          })),
        })),
      ],
      more: { href: docs, label: t("nav.allDocs") },
    },
    {
      id: "roadmap",
      label: t("nav.roadmap"),
      icon: CompassIcon,
      href: routePath("roadmap", locale),
      columns: [],
    },
    {
      id: "app",
      label: t("nav.app"),
      icon: SmartphoneIcon,
      columns: [
        {
          links: [
            {
              href: routePath("download", locale),
              label: t("nav.download"),
              description: t("nav.download.desc"),
              icon: DownloadIcon,
            },
            {
              href: mobileAppReleases,
              label: t("nav.changelog"),
              description: t("nav.changelog.desc"),
              icon: BookmarkIcon,
              external: true,
            },
            {
              href: routePath("contact", locale),
              label: t("nav.contact"),
              description: t("nav.contact.desc"),
              icon: MailIcon,
            },
          ],
        },
      ],
    },
  ];
};

/** A link is current on its own page and on anything nested under it. */
export const isCurrentLink = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/** A section is current when its own link or any link inside it is. */
export const isCurrentSection = (pathname: string, section: MenuSection) => {
  if (section.href) return isCurrentLink(pathname, section.href);
  const links: Pick<MenuLink, "href" | "external">[] = [
    ...section.columns.flatMap((c) => c.links),
    ...(section.more ? [section.more] : []),
  ];
  return links.some((l) => !l.external && isCurrentLink(pathname, l.href));
};
