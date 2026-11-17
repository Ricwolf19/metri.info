import type { ComponentType } from "react";

import {
  ActivityIcon,
  AppleIcon,
  DumbbellIcon,
  FlameIcon,
  type IconProps,
  MoonIcon,
  ScaleIcon,
  TrendingUpIcon,
  ZapIcon,
} from "@/components/icons";
import type { Locale } from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n/en";

/**
 * The guides the site menu's Learn panel recommends, in two topic columns
 * next to the knowledge check and the glossary. Importable from Client
 * Components; every slug must exist in both locales (`featured.test.ts`).
 */
export const FEATURED_DOCS: {
  key: TranslationKey;
  docs: readonly { slug: string; icon: ComponentType<IconProps> }[];
}[] = [
  {
    key: "docs.category.nutrition",
    docs: [
      { slug: "choosing-your-phase", icon: ScaleIcon },
      { slug: "tdee", icon: FlameIcon },
      { slug: "macros", icon: AppleIcon },
      { slug: "breaking-a-plateau", icon: ActivityIcon },
    ],
  },
  {
    key: "docs.category.training",
    docs: [
      { slug: "progressive-overload", icon: TrendingUpIcon },
      { slug: "volume-frequency", icon: DumbbellIcon },
      { slug: "training-intensity", icon: ZapIcon },
      { slug: "sleep", icon: MoonIcon },
    ],
  },
];

/** Each featured guide's title per language. */
export type DocTitles = Record<Locale, Record<string, string>>;

type DocsIndex = Record<Locale, { slug: string; title: string }[]>;

/** The featured guides' titles out of the docs index, so the header gets
 * those few names and not the whole index. */
export const featuredDocTitles = (index: DocsIndex): DocTitles => {
  const featured = new Set(
    FEATURED_DOCS.flatMap((group) => group.docs.map((d) => d.slug)),
  );
  const pick = (locale: Locale) =>
    Object.fromEntries(
      index[locale]
        .filter((d) => featured.has(d.slug))
        .map((d) => [d.slug, d.title]),
    );
  return { en: pick("en"), es: pick("es") };
};
