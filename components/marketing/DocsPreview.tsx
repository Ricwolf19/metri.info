"use client";

import Link from "next/link";

import {
  AppleIcon,
  ArrowRightIcon,
  DumbbellIcon,
  HeartIcon,
  type IconProps,
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

const CATEGORIES: {
  icon: React.ComponentType<IconProps>;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}[] = [
  {
    icon: AppleIcon,
    titleKey: "docs.catNutrition",
    descKey: "docs.catNutritionDesc",
  },
  {
    icon: DumbbellIcon,
    titleKey: "docs.catTraining",
    descKey: "docs.catTrainingDesc",
  },
  {
    icon: HeartIcon,
    titleKey: "docs.catRecovery",
    descKey: "docs.catRecoveryDesc",
  },
];

export const DocsPreview = () => {
  const { t, locale } = useI18n();

  return (
    <Section className="border-t border-ink-600/40 bg-ink-850">
      <SectionHeading
        eyebrow={t("nav.docs")}
        title={t("docs.title")}
        subtitle={t("docs.subtitle")}
      />

      <AnimatedSection className="mt-12 grid gap-5 md:grid-cols-3">
        {CATEGORIES.map(({ icon: Icon, titleKey, descKey }) => (
          <AnimatedItem key={titleKey}>
            <Link href={routePath("docs", locale)} className="block h-full">
              <GlowCard className="h-full">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10 text-accent">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink-50">
                  {t(titleKey)}
                </h3>
                <p className="mt-2 text-sm text-ink-300">{t(descKey)}</p>
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
