"use client";

import Link from "next/link";

import {
  ArrowRightIcon,
  CodeIcon,
  DownloadIcon,
  type IconProps,
  WifiOffIcon,
} from "@/components/icons";
import { BenefitsPanel } from "@/components/marketing/BenefitsPanel";
import { Reveal } from "@/components/motion/Reveal";
import { Section, SectionHeading } from "@/components/shared/Section";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { routePath } from "@/lib/i18n/routes";
import { mobileAppRepo } from "@/lib/site";

/** What every tier shares — the ownership promise, in three lines. */
const OWN: { icon: React.ComponentType<IconProps>; key: TranslationKey }[] = [
  { icon: WifiOffIcon, key: "plans.own1" },
  { icon: DownloadIcon, key: "plans.own2" },
  { icon: CodeIcon, key: "plans.own3" },
];

/** Local / Free account / Premium, with the honest footnote: Premium is cloud
 * sync, it is granted on request during the beta, and nothing costs money.
 * Closes with the ownership strip (offline, exportable, MIT) and the repo. */
export const PlansSection = () => {
  const { t, locale } = useI18n();

  return (
    <Section id="plans">
      <SectionHeading
        eyebrow={t("plans.eyebrow")}
        title={t("plans.title")}
        highlight={t("plans.highlight")}
        subtitle={t("plans.subtitle")}
      />

      <Reveal className="mt-12">
        <BenefitsPanel />
      </Reveal>

      <Reveal delay={0.1} className="mt-8 flex flex-col items-center gap-5">
        <p className="max-w-2xl text-center text-sm text-pretty text-ink-400">
          {t("plans.note")}{" "}
          <Link
            href={routePath("terms", locale)}
            className="text-ink-200 underline underline-offset-4 hover:text-accent"
          >
            {t("plans.noteLink")}
          </Link>
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={routePath("signUp", locale)}
            className={buttonVariants({ size: "lg" })}
          >
            {t("plans.ctaCreate")}
            <ArrowRightIcon size={18} />
          </Link>
          <Link
            href={routePath("contact", locale)}
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            {t("plans.ctaPremium")}
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="mt-14">
        <ul className="grid gap-3 sm:grid-cols-3">
          {OWN.map(({ icon: Icon, key }) => (
            <li
              key={key}
              className="flex items-center gap-3 rounded-field border border-ink-600/70 bg-ink-850 px-4 py-3 text-sm font-medium text-ink-100"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                <Icon size={17} />
              </span>
              {t(key)}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-sm text-ink-400">
          <a
            href={mobileAppRepo}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
          >
            {t("plans.repo")}
            <ArrowRightIcon size={14} />
          </a>
        </p>
      </Reveal>
    </Section>
  );
};
