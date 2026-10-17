"use client";

import Link from "next/link";

import { CALC_ICONS } from "@/components/calculators/calcIcons";
import {
  ArrowRightIcon,
  BookIcon,
  CalculatorIcon,
  CheckIcon,
  type IconProps,
} from "@/components/icons";
import { CalcExample } from "@/components/marketing/CalcExample";
import { Reveal } from "@/components/motion/Reveal";
import { QuizPromo } from "@/components/quiz/QuizPromo";
import { GlowCard } from "@/components/shared/GlowCard";
import { Section, SectionHeading } from "@/components/shared/Section";
import { CALC_CONTENT } from "@/lib/calculators/content";
import { isPopularCalc } from "@/lib/calculators/registry";
import {
  CATEGORY_ICON,
  CATEGORY_LABEL,
  DOC_CATEGORIES,
  docsSectionId,
} from "@/lib/docs/categories";
import { useI18n } from "@/lib/i18n";
import { CALC_IDS, routePath } from "@/lib/i18n/routes";

const POPULAR = CALC_IDS.filter(isPopularCalc);

const CardHead = ({
  icon: Icon,
  eyebrow,
  title,
  body,
}: {
  icon: React.ComponentType<IconProps>;
  eyebrow: string;
  title: string;
  body: string;
}) => (
  <>
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-field border border-brand/30 bg-brand/10 text-brand">
        <Icon size={22} />
      </span>
      <span className="font-mono text-xs tracking-widest text-ink-400 uppercase">
        {eyebrow}
      </span>
    </div>
    <h3 className="mt-5 text-2xl font-bold tracking-tight text-balance text-ink-50">
      {title}
    </h3>
    <p className="mt-2 text-pretty text-ink-300">{body}</p>
  </>
);

const Points = ({ items }: { items: string[] }) => (
  <ul className="mt-4 space-y-2">
    {items.map((p) => (
      <li key={p} className="flex items-center gap-2.5 text-sm text-ink-200">
        <CheckIcon size={16} className="shrink-0 text-brand" />
        {p}
      </li>
    ))}
  </ul>
);

const CtaLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-accent hover:underline"
  >
    {label}
    <ArrowRightIcon size={16} />
  </Link>
);

/** The web half of Metri in one section: the calculators (with the live TDEE
 * example and the six most-used tools) beside the knowledge base (a sample
 * entry and its eight sections). */
export const WebPreview = () => {
  const { t, locale } = useI18n();
  const docsHref = routePath("docs", locale);

  return (
    <Section id="web" className="border-t border-ink-600/40 bg-ink-850">
      <SectionHeading
        eyebrow={t("web.eyebrow")}
        title={t("web.title")}
        highlight={t("web.highlight")}
        subtitle={t("web.subtitle")}
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <GlowCard className="flex h-full flex-col p-6 sm:p-7">
            <CardHead
              icon={CalculatorIcon}
              eyebrow={`${CALC_IDS.length} · ${t("nav.tools")}`}
              title={t("tools.example.title")}
              body={t("tools.example.body")}
            />
            <Points
              items={[
                t("tools.example.p1"),
                t("tools.example.p2"),
                t("tools.example.p3"),
              ]}
            />
            <div className="mt-6">
              <CalcExample
                label={t("calc.result.tdee")}
                unit="kcal"
                caption={t("tools.example.caption")}
              />
            </div>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {POPULAR.map((id) => {
                const Icon = CALC_ICONS[id];
                return (
                  <li key={id}>
                    <Link
                      href={routePath(id, locale)}
                      className="group flex items-center gap-2.5 rounded-field border border-ink-600/70 bg-ink-900/60 px-3 py-2.5 text-sm font-medium text-ink-200 transition-colors hover:border-brand/40 hover:text-ink-50"
                    >
                      <Icon size={16} className="shrink-0 text-brand" />
                      <span className="truncate">
                        {CALC_CONTENT[id][locale].h1}
                      </span>
                      <ArrowRightIcon
                        size={14}
                        className="ml-auto shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-200"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <CtaLink
              href={routePath("tools", locale)}
              label={t("home.toolsCta")}
            />
          </GlowCard>
        </Reveal>

        <Reveal delay={0.08}>
          <GlowCard className="flex h-full flex-col p-6 sm:p-7">
            <CardHead
              icon={BookIcon}
              eyebrow={`20+ · ${t("nav.docs")}`}
              title={t("docs.example.title")}
              body={t("docs.example.body")}
            />
            <Points items={[t("docs.example.p1"), t("docs.example.p2")]} />
            <div className="mt-6 rounded-field border border-ink-600/70 bg-ink-900/60 p-4">
              <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 font-mono text-[10px] tracking-widest text-brand uppercase">
                {t("docs.category.calculators")}
              </span>
              <h4 className="mt-3 text-lg font-semibold text-ink-50">
                {t("docs.example.snippetTitle")}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">
                {t("docs.example.snippetBody")}
              </p>
              <div className="mt-3 flex items-center gap-2 border-t border-ink-700 pt-3 font-mono text-xs text-ink-400">
                <BookIcon size={13} />5 min · {t("calc.sourcesTitle")}
              </div>
            </div>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {DOC_CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICON[category];
                return (
                  <li key={category}>
                    <Link
                      href={`${docsHref}#${docsSectionId(category)}`}
                      className="group flex items-center gap-2.5 rounded-field border border-ink-600/70 bg-ink-900/60 px-3 py-2.5 text-sm font-medium text-ink-200 transition-colors hover:border-brand/40 hover:text-ink-50"
                    >
                      <Icon size={16} className="shrink-0 text-brand" />
                      <span className="truncate">
                        {t(CATEGORY_LABEL[category])}
                      </span>
                      <ArrowRightIcon
                        size={14}
                        className="ml-auto shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-200"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <QuizPromo compact className="mt-5" />
            <CtaLink href={docsHref} label={t("home.docsCta")} />
          </GlowCard>
        </Reveal>
      </div>
    </Section>
  );
};
