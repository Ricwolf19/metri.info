"use client";

import Link from "next/link";

import {
  AppleIcon,
  ArrowRightIcon,
  BookIcon,
  CalculatorIcon,
  DumbbellIcon,
  HeartIcon,
  type IconProps,
  TrendingUpIcon,
  ZapIcon,
} from "@/components/icons";
import {
  AnimatedItem,
  AnimatedSection,
} from "@/components/shared/AnimatedSection";
import { GlowCard } from "@/components/shared/GlowCard";
import { Section, SectionHeading } from "@/components/shared/Section";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { routePath } from "@/lib/i18n/routes";

/** Mirrors DOC_CATEGORIES — the eight knowledge-base sections, with sample
 * topics so the homepage reflects the real breadth of the docs. */
const CATEGORIES: {
  icon: React.ComponentType<IconProps>;
  labelKey: TranslationKey;
  topicsKey: TranslationKey;
}[] = [
  {
    icon: BookIcon,
    labelKey: "docs.category.gettingStarted",
    topicsKey: "docs.topics.gettingStarted",
  },
  {
    icon: CalculatorIcon,
    labelKey: "docs.category.calculators",
    topicsKey: "docs.topics.calculators",
  },
  {
    icon: AppleIcon,
    labelKey: "docs.category.nutrition",
    topicsKey: "docs.topics.nutrition",
  },
  {
    icon: DumbbellIcon,
    labelKey: "docs.category.training",
    topicsKey: "docs.topics.training",
  },
  {
    icon: HeartIcon,
    labelKey: "docs.category.recovery",
    topicsKey: "docs.topics.recovery",
  },
  {
    icon: ZapIcon,
    labelKey: "docs.category.supplements",
    topicsKey: "docs.topics.supplements",
  },
  {
    icon: TrendingUpIcon,
    labelKey: "docs.category.progress",
    topicsKey: "docs.topics.progress",
  },
  {
    icon: BookIcon,
    labelKey: "docs.category.glossary",
    topicsKey: "docs.topics.glossary",
  },
];

export const DocsPreview = () => {
  const { t, locale } = useI18n();

  return (
    <Section className="border-t border-ink-600/40 bg-ink-850">
      <SectionHeading
        eyebrow={t("nav.docs")}
        title={t("docs.title")}
        subtitle={t("home.docsLead")}
      />

      <AnimatedSection className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map(({ icon: Icon, labelKey, topicsKey }) => (
          <AnimatedItem key={labelKey}>
            <Link href={routePath("docs", locale)} className="block h-full">
              <GlowCard className="flex h-full flex-col p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-700 text-accent">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink-50">
                  {t(labelKey)}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-300">
                  {t(topicsKey)}
                </p>
              </GlowCard>
            </Link>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      <div className="mt-10 text-center">
        <Link
          href={routePath("docs", locale)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          {t("home.docsCta")}
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </Section>
  );
};
