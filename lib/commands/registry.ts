import { CALC_ICONS } from "@/components/calculators/calcIcons";
import {
  BookIcon,
  BookmarkIcon,
  CalculatorIcon,
  DownloadIcon,
  GearIcon,
  type IconProps,
  MailIcon,
  StarIcon,
} from "@/components/icons";
import type { Locale } from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n/en";
import {
  CALC_IDS,
  type CalcRouteId,
  type RouteId,
  routePath,
} from "@/lib/i18n/routes";

export type CommandGroup = "pages" | "calculators" | "docs" | "account";

export type CommandDoc = { slug: string; title: string };

export type Command = {
  id: string;
  group: CommandGroup;
  label: string;
  href: string;
  icon: React.ComponentType<IconProps>;
  /** Extra search terms (slug, synonyms) — not shown, only matched. */
  keywords?: string;
};

/** Title key per calculator (mirrors the marketing previews). */
const CALC_TITLE: Record<CalcRouteId, TranslationKey> = {
  onerm: "tools.onerm.title",
  tdee: "tools.bmr.title",
  macros: "tools.macros.title",
  bodyfat: "tools.bodyfat.title",
  bmi: "tools.ideal.title",
  ffmi: "tools.ffmi.title",
  water: "tools.water.title",
  plates: "tools.plates.title",
  idealweight: "tools.idealweight.title",
  deficit: "tools.deficit.title",
  protein: "tools.protein.title",
  leanmass: "tools.leanmass.title",
  heartrate: "tools.heartrate.title",
  whtr: "tools.whtr.title",
  wilks: "tools.wilks.title",
  calsburned: "tools.calsburned.title",
};

const PAGES: {
  id: RouteId;
  key: TranslationKey;
  icon: React.ComponentType<IconProps>;
}[] = [
  { id: "tools", key: "nav.tools", icon: CalculatorIcon },
  { id: "docs", key: "nav.docs", icon: BookIcon },
  { id: "download", key: "nav.download", icon: DownloadIcon },
  { id: "changelog", key: "nav.changelog", icon: BookmarkIcon },
  { id: "contact", key: "nav.contact", icon: MailIcon },
];

/**
 * Build the command-palette entries. Scalable by construction: pages come from
 * the route map, calculators are generated from `CALC_IDS` (+ their icons), and
 * account entries appear only when signed in. To add a command, extend `PAGES`
 * or add a route — no palette UI changes needed.
 */
export const buildCommands = (
  t: (key: TranslationKey) => string,
  locale: Locale,
  opts: { signedIn: boolean; docs: CommandDoc[] },
): Command[] => {
  const commands: Command[] = PAGES.map((p) => ({
    id: p.id,
    group: "pages",
    label: t(p.key),
    href: routePath(p.id, locale),
    icon: p.icon,
  }));

  for (const id of CALC_IDS) {
    commands.push({
      id: `calc-${id}`,
      group: "calculators",
      label: t(CALC_TITLE[id]),
      href: routePath(id, locale),
      icon: CALC_ICONS[id],
      keywords: id,
    });
  }

  const docsBase = routePath("docs", locale);
  for (const d of opts.docs) {
    commands.push({
      id: `doc-${d.slug}`,
      group: "docs",
      label: d.title,
      href: `${docsBase}/${d.slug}`,
      icon: BookIcon,
      keywords: d.slug,
    });
  }

  if (opts.signedIn) {
    commands.push(
      {
        id: "account",
        group: "account",
        label: t("nav.account"),
        href: routePath("account", locale),
        icon: GearIcon,
      },
      {
        id: "activity",
        group: "account",
        label: t("nav.activity"),
        href: routePath("activity", locale),
        icon: StarIcon,
      },
    );
  }

  return commands;
};

export const GROUP_LABEL: Record<CommandGroup, TranslationKey> = {
  pages: "cmd.group.pages",
  calculators: "cmd.group.calculators",
  docs: "cmd.group.docs",
  account: "cmd.group.account",
};
