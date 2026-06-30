"use client";

import {
  BookIcon,
  CalculatorIcon,
  SearchIcon,
  StarIcon,
  WifiOffIcon,
  type IconProps,
} from "@/components/icons";
import { Term } from "@/components/docs/Term";
import { Container } from "@/components/shared/Container";
import { GlowCard } from "@/components/shared/GlowCard";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";

const FEATURES: {
  icon: React.ComponentType<IconProps>;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}[] = [
  {
    icon: CalculatorIcon,
    titleKey: "about.features.calc.title",
    descKey: "about.features.calc.desc",
  },
  {
    icon: BookIcon,
    titleKey: "about.features.docs.title",
    descKey: "about.features.docs.desc",
  },
  {
    icon: StarIcon,
    titleKey: "about.features.account.title",
    descKey: "about.features.account.desc",
  },
  {
    icon: WifiOffIcon,
    titleKey: "about.features.offline.title",
    descKey: "about.features.offline.desc",
  },
  {
    icon: SearchIcon,
    titleKey: "about.features.cmd.title",
    descKey: "about.features.cmd.desc",
  },
];

/** "What you can do" — surfaces the app's features on the About page, and
 * demonstrates the glossary <Term> highlighting (hover/click a term to learn it). */
export const AboutFeatures = () => {
  const { t, locale } = useI18n();

  return (
    <section className="border-t border-ink-600/40 py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-medium tracking-widest text-brand uppercase">
            {t("about.features.eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance text-ink-50">
            {t("about.features.title")}
          </h2>
          <p className="mt-4 text-pretty text-ink-300">
            {t("about.features.lead")}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, titleKey, descKey }) => (
            <GlowCard key={titleKey} className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-field border border-brand/30 bg-brand/10 text-brand">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-50">
                {t(titleKey)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
                {t(descKey)}
              </p>
            </GlowCard>
          ))}
        </div>

        <div className="mt-8 rounded-card border border-ink-600 bg-ink-850 p-5">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-300">
            {t("about.features.glossaryHint")}
            <Term id="tdee" locale={locale}>
              TDEE
            </Term>
            <span className="text-ink-600">·</span>
            <Term id="rir" locale={locale}>
              RIR
            </Term>
            <span className="text-ink-600">·</span>
            <Term id="ffmi" locale={locale}>
              FFMI
            </Term>
          </p>
        </div>
      </Container>
    </section>
  );
};
