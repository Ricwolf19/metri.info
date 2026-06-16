"use client";

import Link from "next/link";

import { CALC_ICONS } from "@/components/calculators/calcIcons";
import { ArrowRightIcon } from "@/components/icons";
import {
  AnimatedItem,
  AnimatedSection,
} from "@/components/shared/AnimatedSection";
import { GlowCard } from "@/components/shared/GlowCard";
import { Section, SectionHeading } from "@/components/shared/Section";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { CALC_IDS, type CalcRouteId, routePath } from "@/lib/i18n/routes";
import { isPopularCalc } from "@/lib/calculators/registry";

/** Title key per calculator — the popular ones surface on the homepage. */
const TITLE_KEYS: Record<CalcRouteId, TranslationKey> = {
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

const DESC_KEYS: Record<CalcRouteId, TranslationKey> = {
  onerm: "tools.onerm.desc",
  tdee: "tools.bmr.desc",
  macros: "tools.macros.desc",
  bodyfat: "tools.bodyfat.desc",
  bmi: "tools.ideal.desc",
  ffmi: "tools.ffmi.desc",
  water: "tools.water.desc",
  plates: "tools.plates.desc",
  idealweight: "tools.idealweight.desc",
  deficit: "tools.deficit.desc",
  protein: "tools.protein.desc",
  leanmass: "tools.leanmass.desc",
  heartrate: "tools.heartrate.desc",
  whtr: "tools.whtr.desc",
  wilks: "tools.wilks.desc",
  calsburned: "tools.calsburned.desc",
};

const POPULAR = CALC_IDS.filter(isPopularCalc);

/** The remaining (non-popular) calculators, surfaced as quick-link chips. */
const MORE = CALC_IDS.filter((id) => !isPopularCalc(id));

export const ToolsPreview = () => {
  const { t, locale } = useI18n();

  return (
    <Section>
      <SectionHeading
        eyebrow={t("nav.tools")}
        title={t("tools.title")}
        subtitle={t("home.toolsLead")}
      />

      <AnimatedSection className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {POPULAR.map((id) => {
          const Icon = CALC_ICONS[id];
          return (
            <AnimatedItem key={id}>
              <Link href={routePath(id, locale)} className="block h-full">
                <GlowCard className="flex h-full flex-col">
                  <div className="flex items-center gap-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-700 text-accent">
                      <Icon size={22} />
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-ink-950/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ink-950 dark:bg-lime-400/10 dark:text-lime-400"
                      aria-label={t("tools.popularAria")}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-ink-950 dark:bg-lime-400" />
                      {t("tools.popular")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink-50">
                    {t(TITLE_KEYS[id])}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-300">
                    {t(DESC_KEYS[id])}
                  </p>
                </GlowCard>
              </Link>
            </AnimatedItem>
          );
        })}
      </AnimatedSection>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {MORE.map((id) => (
          <Link
            key={id}
            href={routePath(id, locale)}
            className="rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5 text-xs font-medium text-ink-300 transition-colors hover:border-ink-500 hover:text-ink-50"
          >
            {t(TITLE_KEYS[id])}
          </Link>
        ))}
      </div>

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
