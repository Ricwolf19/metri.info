"use client";

import Link from "next/link";

import {
  ActivityIcon,
  AppleIcon,
  ArrowRightIcon,
  DumbbellIcon,
  FlameIcon,
  RulerIcon,
  ScaleIcon,
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
import { type RouteId, routePath } from "@/lib/i18n/routes";

const TOOLS: {
  id: RouteId;
  icon: React.ComponentType<IconProps>;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}[] = [
  {
    id: "ffmi",
    icon: ActivityIcon,
    titleKey: "tools.ffmi.title",
    descKey: "tools.ffmi.desc",
  },
  {
    id: "onerm",
    icon: DumbbellIcon,
    titleKey: "tools.onerm.title",
    descKey: "tools.onerm.desc",
  },
  {
    id: "tdee",
    icon: FlameIcon,
    titleKey: "tools.bmr.title",
    descKey: "tools.bmr.desc",
  },
  {
    id: "macros",
    icon: AppleIcon,
    titleKey: "tools.macros.title",
    descKey: "tools.macros.desc",
  },
  {
    id: "bodyfat",
    icon: ScaleIcon,
    titleKey: "tools.bodyfat.title",
    descKey: "tools.bodyfat.desc",
  },
  {
    id: "bmi",
    icon: RulerIcon,
    titleKey: "tools.ideal.title",
    descKey: "tools.ideal.desc",
  },
];

export const ToolsPreview = () => {
  const { t, locale } = useI18n();

  return (
    <Section>
      <SectionHeading
        eyebrow={t("nav.tools")}
        title={t("tools.title")}
        subtitle={t("tools.subtitle")}
      />

      <AnimatedSection className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map(({ id, icon: Icon, titleKey, descKey }) => (
          <AnimatedItem key={id}>
            <Link href={routePath(id, locale)} className="block h-full">
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
          href={routePath("tools", locale)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          {t("home.toolsCta")}
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </Section>
  );
};
