import Link from "next/link";

import { Calculator } from "@/components/calculators/Calculator";
import { ArrowRightIcon } from "@/components/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/shared/Container";
import { getT } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import { CALC_IDS, routePath, type CalcRouteId } from "@/lib/i18n/routes";
import { CALC_CONTENT } from "@/lib/calculators/content";
import { absoluteUrl } from "@/lib/utils";

export const CalculatorPage = async ({
  locale,
  id,
}: {
  locale: Locale;
  id: CalcRouteId;
}) => {
  const t = await getT();
  const c = CALC_CONTENT[id][locale];
  const toolsPath = routePath("tools", locale);
  const selfPath = routePath(id, locale);
  const related = CALC_IDS.filter((x) => x !== id).slice(0, 4);

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
        { name: "METRI", url: routePath("home", locale) },
        { name: t("nav.tools"), url: toolsPath },
        { name: c.h1, url: selfPath },
      ].map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: absoluteUrl(item.url),
      })),
    },
  ];

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-ink-400">
          <Link href={toolsPath} className="hover:text-ink-200">
            {t("nav.tools")}
          </Link>
          <span>/</span>
          <span className="text-ink-300">{c.h1}</span>
        </nav>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance text-ink-50 sm:text-5xl">
          {c.h1}
        </h1>
        <p className="mt-3 text-lg text-ink-300">{c.tagline}</p>

        {/* Interactive calculator */}
        <div className="mt-8">
          <Calculator id={id} />
        </div>

        {/* Content */}
        <div className="mt-12 space-y-10">
          <section>
            {c.about.map((p, i) => (
              <p key={i} className="leading-relaxed text-ink-200">
                {p}
              </p>
            ))}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-50">
              {t("calc.howTitle")}
            </h2>
            {c.how.map((p, i) => (
              <p key={i} className="mt-4 leading-relaxed text-ink-200">
                {p}
              </p>
            ))}
            {c.formula && (
              <pre className="mt-5 overflow-x-auto rounded-xl border border-ink-600 bg-ink-950 p-4 font-mono text-sm text-ink-100">
                {c.formula}
              </pre>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-50">
              {t("calc.interpretTitle")}
            </h2>
            {c.interpret.map((p, i) => (
              <p key={i} className="mt-4 leading-relaxed text-ink-200">
                {p}
              </p>
            ))}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-50">
              {t("calc.faqTitle")}
            </h2>
            <dl className="mt-4 space-y-5">
              {c.faq.map((f) => (
                <div
                  key={f.q}
                  className="rounded-xl border border-ink-600 bg-ink-800 p-5"
                >
                  <dt className="font-semibold text-ink-50">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink-300">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Related */}
          <section>
            <h2 className="text-2xl font-bold text-ink-50">
              {t("calc.relatedTitle")}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r}
                  href={routePath(r, locale)}
                  className="group flex items-center justify-between rounded-xl border border-ink-600 bg-ink-800 px-4 py-3 transition-colors hover:border-lime-400/40"
                >
                  <span className="font-medium text-ink-100">
                    {CALC_CONTENT[r][locale].h1}
                  </span>
                  <ArrowRightIcon
                    size={16}
                    className="text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
};
