"use client";

import Link from "next/link";

import {
  ArrowRightIcon,
  BookIcon,
  CalculatorIcon,
  CodeIcon,
  type IconProps,
  ShieldIcon,
  WifiOffIcon,
} from "@/components/icons";
import {
  AnimatedItem,
  AnimatedSection,
} from "@/components/shared/AnimatedSection";
import { Section, SectionHeading } from "@/components/shared/Section";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { type RouteId, routePath } from "@/lib/i18n/routes";
import { webAppRepo } from "@/lib/site";

const CALC_CHIPS: { id: RouteId; key: TranslationKey }[] = [
  { id: "ffmi", key: "tools.ffmi.title" },
  { id: "onerm", key: "tools.onerm.title" },
  { id: "tdee", key: "tools.bmr.title" },
  { id: "macros", key: "tools.macros.title" },
  { id: "bodyfat", key: "tools.bodyfat.title" },
  { id: "bmi", key: "tools.ideal.title" },
];

const IconTile = ({ icon: Icon }: { icon: React.ComponentType<IconProps> }) => (
  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-700 text-accent">
    <Icon size={22} />
  </span>
);

export const Bento = () => {
  const { t, locale } = useI18n();

  return (
    <Section>
      <SectionHeading
        eyebrow={t("bento.eyebrow")}
        title={t("bento.title")}
        highlight={t("bento.highlight")}
        subtitle={t("bento.subtitle")}
      />

      <AnimatedSection className="mt-12 grid auto-rows-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {/* Big feature — the calculators (the product) */}
        <AnimatedItem className="sm:col-span-2 lg:col-span-4 lg:row-span-2">
          <Card className="group relative flex h-full flex-col overflow-hidden p-7">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-ink-700/60 blur-3xl"
            />
            <div className="relative">
              <IconTile icon={CalculatorIcon} />
              <h3 className="mt-5 text-2xl font-bold text-ink-50">
                {t("bento.calc.title")}
              </h3>
              <p className="mt-2 max-w-md text-ink-300">
                {t("bento.calc.desc")}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {CALC_CHIPS.map(({ id, key }) => (
                  <Link key={id} href={routePath(id, locale)}>
                    <Badge
                      variant="outline"
                      className="transition-colors hover:border-ink-500 hover:text-ink-50"
                    >
                      {t(key)}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href={routePath("tools", locale)}
              className="relative mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-accent hover:underline"
            >
              {t("bento.calc.cta")}
              <ArrowRightIcon
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Card>
        </AnimatedItem>

        {/* Open source */}
        <AnimatedItem className="lg:col-span-2">
          <Card className="flex h-full flex-col p-6">
            <IconTile icon={CodeIcon} />
            <h3 className="mt-4 text-lg font-semibold text-ink-50">
              {t("bento.oss.title")}
            </h3>
            <p className="mt-2 text-sm text-ink-300">{t("bento.oss.desc")}</p>
            <a
              href={webAppRepo}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-accent hover:underline"
            >
              {t("oss.cta")}
              <ArrowRightIcon size={16} />
            </a>
          </Card>
        </AnimatedItem>

        {/* Offline */}
        <AnimatedItem className="lg:col-span-2">
          <Card className="flex h-full flex-col p-6">
            <IconTile icon={WifiOffIcon} />
            <h3 className="mt-4 text-lg font-semibold text-ink-50">
              {t("bento.offline.title")}
            </h3>
            <p className="mt-2 text-sm text-ink-300">
              {t("bento.offline.desc")}
            </p>
          </Card>
        </AnimatedItem>

        {/* Knowledge base */}
        <AnimatedItem className="sm:col-span-2 lg:col-span-3">
          <Card className="flex h-full flex-col p-6">
            <IconTile icon={BookIcon} />
            <h3 className="mt-4 text-lg font-semibold text-ink-50">
              {t("bento.docs.title")}
            </h3>
            <p className="mt-2 text-sm text-ink-300">{t("bento.docs.desc")}</p>
            <Link
              href={routePath("docs", locale)}
              className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-accent hover:underline"
            >
              {t("bento.docs.cta")}
              <ArrowRightIcon size={16} />
            </Link>
          </Card>
        </AnimatedItem>

        {/* Privacy */}
        <AnimatedItem className="sm:col-span-2 lg:col-span-3">
          <Card className="flex h-full flex-col p-6">
            <IconTile icon={ShieldIcon} />
            <h3 className="mt-4 text-lg font-semibold text-ink-50">
              {t("bento.privacy.title")}
            </h3>
            <p className="mt-2 text-sm text-ink-300">
              {t("bento.privacy.desc")}
            </p>
          </Card>
        </AnimatedItem>
      </AnimatedSection>
    </Section>
  );
};
