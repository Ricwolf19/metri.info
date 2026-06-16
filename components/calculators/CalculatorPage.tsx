import Link from "next/link";
import { Suspense } from "react";

import { Calculator } from "@/components/calculators/Calculator";
import { CALC_ICONS } from "@/components/calculators/calcIcons";
import { ArrowRightIcon, ChevronRightIcon } from "@/components/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/shared/Container";
import { createT, type Locale } from "@/lib/i18n/config";
import { CALC_IDS, routePath, type CalcRouteId } from "@/lib/i18n/routes";
import { CALC_CONTENT } from "@/lib/calculators/content";
import { isPopularCalc } from "@/lib/calculators/registry";
import {
  CALC_AUTHOR,
  CALC_LAST_REVIEWED,
  CALC_SOURCES,
  HEALTH_CALCS,
} from "@/lib/calculators/sources";
import { absoluteUrl } from "@/lib/utils";

const SECTION = {
  overview: "overview",
  how: "how-it-works",
  interpret: "interpret",
  faq: "faq",
  sources: "sources",
} as const;

export const CalculatorPage = async ({
  locale,
  id,
}: {
  locale: Locale;
  id: CalcRouteId;
}) => {
  const t = createT(locale);
  const c = CALC_CONTENT[id][locale];
  const toolsPath = routePath("tools", locale);
  const selfPath = routePath(id, locale);
  const related = CALC_IDS.filter((x) => x !== id).slice(0, 4);

  const sources = CALC_SOURCES[id];
  const isHealth = HEALTH_CALCS.has(id);
  const reviewedDate = new Date(CALC_LAST_REVIEWED).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const toc: { id: string; label: string }[] = [
    { id: SECTION.overview, label: t("calc.overviewTitle") },
    { id: SECTION.how, label: t("calc.howTitle") },
    { id: SECTION.interpret, label: t("calc.interpretTitle") },
    { id: SECTION.faq, label: t("calc.faqTitle") },
    ...(sources.length > 0
      ? [{ id: SECTION.sources, label: t("calc.sourcesTitle") }]
      : []),
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: c.h1,
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      description: c.seoDescription,
      url: absoluteUrl(selfPath),
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      inLanguage: locale,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "Metri", url: routePath("home", locale) },
        { name: t("nav.tools"), url: toolsPath },
        { name: c.h1, url: selfPath },
      ].map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: absoluteUrl(item.url),
      })),
    },
    ...(isHealth
      ? [
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            name: c.h1,
            url: absoluteUrl(selfPath),
            description: c.seoDescription,
            inLanguage: locale,
            lastReviewed: CALC_LAST_REVIEWED,
            datePublished: CALC_LAST_REVIEWED,
            dateModified: CALC_LAST_REVIEWED,
            author: {
              "@type": "Person",
              name: CALC_AUTHOR.name,
              url: CALC_AUTHOR.url,
            },
            reviewedBy: {
              "@type": "Person",
              name: CALC_AUTHOR.name,
              url: CALC_AUTHOR.url,
            },
            publisher: { "@type": "Organization", name: "Metri" },
            citation: sources.map((s) => s.url ?? s.text),
          },
        ]
      : []),
  ];

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center gap-1.5 text-sm text-ink-400">
          <Link href={toolsPath} className="hover:text-ink-200">
            {t("nav.tools")}
          </Link>
          <ChevronRightIcon size={14} />
          <span className="text-ink-300">{c.h1}</span>
        </nav>

        <div className="mt-6 flex items-center gap-3">
          <p className="text-sm font-semibold tracking-wide text-accent uppercase">
            {t("calc.eyebrow")}
          </p>
          {isPopularCalc(id) && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink-950/10 px-2 py-0.5 text-xs font-semibold tracking-wide text-ink-950 dark:bg-lime-400/10 dark:text-lime-400"
              aria-label={t("tools.popularAria")}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ink-950 dark:bg-lime-400" />
              {t("tools.popular")}
            </span>
          )}
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance text-ink-50 sm:text-5xl">
          {c.h1}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-pretty text-ink-300">
          {c.tagline}
        </p>

        <p className="mt-4 text-sm text-ink-400">
          {t("calc.reviewedBy")}{" "}
          <a
            href={CALC_AUTHOR.url}
            rel="author noreferrer noopener"
            target="_blank"
            className="font-medium text-ink-200 underline-offset-2 hover:text-accent hover:underline"
          >
            {CALC_AUTHOR.name}
          </a>
          <span className="px-1.5 text-ink-600">·</span>
          {t("calc.lastUpdated")}{" "}
          <time dateTime={CALC_LAST_REVIEWED}>{reviewedDate}</time>
        </p>

        <div className="mt-8">
          <Suspense
            fallback={
              <div className="h-64 rounded-card border border-ink-600 bg-ink-800" />
            }
          >
            <Calculator id={id} />
          </Suspense>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_16rem]">
          <article className="min-w-0 space-y-12">
            <section id={SECTION.overview} className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-ink-50">
                {t("calc.overviewTitle")}
              </h2>
              <div className="mt-4 space-y-4">
                {c.about.map((p, i) => (
                  <p key={i} className="leading-relaxed text-ink-200">
                    {p}
                  </p>
                ))}
              </div>
            </section>

            <section id={SECTION.how} className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-ink-50">
                {t("calc.howTitle")}
              </h2>
              <div className="mt-4 space-y-4">
                {c.how.map((p, i) => (
                  <p key={i} className="leading-relaxed text-ink-200">
                    {p}
                  </p>
                ))}
              </div>
              {c.formula && (
                <pre className="mt-5 overflow-x-auto rounded-xl border border-ink-600 bg-ink-850 p-4 font-mono text-sm text-ink-200">
                  {c.formula}
                </pre>
              )}
            </section>

            <section id={SECTION.interpret} className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-ink-50">
                {t("calc.interpretTitle")}
              </h2>
              <div className="mt-4 space-y-4">
                {c.interpret.map((p, i) => (
                  <p key={i} className="leading-relaxed text-ink-200">
                    {p}
                  </p>
                ))}
              </div>
            </section>

            <section id={SECTION.faq} className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-ink-50">
                {t("calc.faqTitle")}
              </h2>
              <div className="mt-4 space-y-3">
                {c.faq.map((f) => (
                  <details
                    key={f.q}
                    className="group rounded-xl border border-ink-600 bg-ink-800 px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex items-center justify-between gap-4 font-semibold text-ink-50 select-none">
                      {f.q}
                      <ChevronRightIcon
                        size={18}
                        className="shrink-0 text-ink-400 transition-transform group-open:rotate-90"
                      />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-ink-300">
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {sources.length > 0 && (
              <section id={SECTION.sources} className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-ink-50">
                  {t("calc.sourcesTitle")}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {sources.map((s) => (
                    <li
                      key={s.text}
                      className="text-sm leading-relaxed text-ink-300"
                    >
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="underline-offset-2 hover:text-accent hover:underline"
                        >
                          {s.text}
                        </a>
                      ) : (
                        s.text
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {isHealth && (
              <section className="rounded-xl border border-ink-700 bg-ink-850 p-5">
                <p className="text-xs font-semibold tracking-wider text-ink-400 uppercase">
                  {t("calc.disclaimerTitle")}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ink-400">
                  {t("calc.disclaimer")}
                </p>
              </section>
            )}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <nav aria-label={t("calc.onThisPage")}>
                <p className="text-xs font-semibold tracking-wider text-ink-400 uppercase">
                  {t("calc.onThisPage")}
                </p>
                <ul className="mt-3 space-y-2 border-l border-ink-600">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="-ml-px block border-l border-transparent py-1 pl-4 text-sm text-ink-400 transition-colors hover:border-accent hover:text-ink-100"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="rounded-card border border-ink-600 bg-ink-800 p-5">
                <p className="font-semibold text-ink-50">
                  {t("calc.trustTitle")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">
                  {t("calc.trustBody")}
                </p>
                <Link
                  href={toolsPath}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  {t("calc.trustCta")}
                  <ArrowRightIcon size={15} />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-ink-50">
            {t("calc.relatedTitle")}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {related.map((r) => {
              const Icon = CALC_ICONS[r];
              return (
                <Link
                  key={r}
                  href={routePath(r, locale)}
                  className="group flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-800 px-4 py-3.5 transition-colors hover:border-ink-500 hover:bg-ink-750"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-700 text-accent">
                    <Icon size={18} />
                  </span>
                  <span className="font-medium text-ink-100">
                    {CALC_CONTENT[r][locale].h1}
                  </span>
                  <ArrowRightIcon
                    size={16}
                    className="ml-auto text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </Container>
  );
};
