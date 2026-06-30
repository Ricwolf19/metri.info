"use client";

import Link from "next/link";

import { MouseGlow } from "@/components/background/MouseGlow";
import {
  ArrowRightIcon,
  BookIcon,
  CalculatorIcon,
  CodeIcon,
  type IconProps,
  ShieldIcon,
  WifiOffIcon,
} from "@/components/icons";
import { CalcChart } from "@/components/calculators/CalcChart";
import { SAMPLE_MACROS } from "@/components/marketing/CalcExample";
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
import { cn } from "@/lib/utils";

const CALC_CHIPS: { id: RouteId; key: TranslationKey }[] = [
  { id: "tdee", key: "tools.bmr.title" },
  { id: "macros", key: "tools.macros.title" },
  { id: "onerm", key: "tools.onerm.title" },
  { id: "bodyfat", key: "tools.bodyfat.title" },
  { id: "idealweight", key: "tools.idealweight.title" },
  { id: "heartrate", key: "tools.heartrate.title" },
];

const IconTile = ({
  icon: Icon,
  brand = false,
}: {
  icon: React.ComponentType<IconProps>;
  brand?: boolean;
}) => (
  <span
    className={cn(
      "flex h-11 w-11 items-center justify-center rounded-field",
      brand
        ? "border border-brand/30 bg-brand/10 text-brand"
        : "bg-ink-700 text-accent",
    )}
  >
    <Icon size={22} />
  </span>
);

const Eyebrow = ({ n }: { n: string }) => (
  <span className="font-mono text-xs tracking-widest text-ink-500">{n}</span>
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

      <AnimatedSection className="mt-12 grid gap-4 sm:grid-cols-2 lg:auto-rows-[minmax(0,1fr)] lg:grid-cols-6">
        <AnimatedItem className="sm:col-span-2 lg:col-span-4 lg:row-span-2">
          <Card className="group relative flex h-full flex-col overflow-hidden p-7">
            <MouseGlow intensity={0.1} radius={320} />
            <div
              aria-hidden
              className="glow-brand pointer-events-none absolute -top-20 right-0 h-64 w-2/3 opacity-70"
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <IconTile icon={CalculatorIcon} brand />
                <Eyebrow n="01" />
              </div>
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

              <div className="mt-6 rounded-field border border-ink-600/70 bg-ink-900/50 p-4">
                <p className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">
                  {t("tools.macros.title")}
                </p>
                <div className="mt-3">
                  <CalcChart chart={SAMPLE_MACROS} size="sm" />
                </div>
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

        <AnimatedItem className="lg:col-span-2">
          <Card className="flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <IconTile icon={CodeIcon} />
              <Eyebrow n="02" />
            </div>
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

        <AnimatedItem className="lg:col-span-2">
          <Card className="flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <IconTile icon={WifiOffIcon} />
              <Eyebrow n="03" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink-50">
              {t("bento.offline.title")}
            </h3>
            <p className="mt-2 text-sm text-ink-300">
              {t("bento.offline.desc")}
            </p>
          </Card>
        </AnimatedItem>

        <AnimatedItem className="sm:col-span-2 lg:col-span-3">
          <Card className="flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <IconTile icon={BookIcon} />
              <Eyebrow n="04" />
            </div>
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

        <AnimatedItem className="sm:col-span-2 lg:col-span-3">
          <Card className="flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <IconTile icon={ShieldIcon} />
              <Eyebrow n="05" />
            </div>
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
