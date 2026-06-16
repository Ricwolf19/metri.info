import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowRightIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { CALC_CONTENT } from "@/lib/calculators/content";
import { CALCULATORS } from "@/lib/calculators/registry";
import { readValues } from "@/lib/calculators/share";
import type { CalcId } from "@/lib/calculators/types";
import { createT, isLocale, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { absoluteUrl } from "@/lib/utils";

type Params = Promise<{ id: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const parse = (
  id: string,
  raw: Record<string, string | string[] | undefined>,
) => {
  if (!(id in CALCULATORS)) return null;
  const calcId = id as CalcId;
  const locale: Locale = isLocale(raw.locale) ? raw.locale : "en";
  const fields = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string" && k !== "locale") fields.set(k, v);
  }
  const config = CALCULATORS[calcId];
  const result = config.compute(readValues(config, (k) => fields.get(k)));
  const ogQuery = new URLSearchParams(fields);
  ogQuery.set("id", calcId);
  ogQuery.set("locale", locale);
  return {
    calcId,
    locale,
    config,
    result,
    content: CALC_CONTENT[calcId][locale],
    calcHref: `${routePath(calcId, locale)}?${fields.toString()}`,
    ogImage: `/og/calc?${ogQuery.toString()}`,
    ogImageAbs: absoluteUrl(`/og/calc?${ogQuery.toString()}`),
  };
};

export const generateMetadata = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}): Promise<Metadata> => {
  const { id } = await params;
  const data = parse(id, await searchParams);
  if (!data) return {};
  const t = createT(data.locale);
  const summary = data.result
    ? `${t(data.result.primaryLabelKey)}: ${data.result.primaryValue}${data.result.primaryUnit ? ` ${data.result.primaryUnit}` : ""}`
    : data.content.tagline;
  const title = `${data.content.h1} — ${summary}`;
  return {
    title,
    description: data.content.tagline,
    // A shareable snapshot, not a canonical page: keep it out of the index but
    // let the link credit flow to the real calculator.
    robots: { index: false, follow: true },
    alternates: { canonical: routePath(data.calcId, data.locale) },
    openGraph: {
      title,
      description: data.content.tagline,
      images: [{ url: data.ogImageAbs, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [data.ogImageAbs] },
  };
};

const SharePage = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) => {
  const { id } = await params;
  const data = parse(id, await searchParams);
  if (!data) notFound();
  const t = createT(data.locale);

  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          {data.content.h1}
        </p>
        {data.result && (
          <p className="mt-3 font-mono text-5xl font-bold text-ink-50 sm:text-6xl">
            {data.result.primaryValue}
            {data.result.primaryUnit && (
              <span className="ml-2 text-2xl text-ink-300">
                {data.result.primaryUnit}
              </span>
            )}
          </p>
        )}
        {data.result && (
          <p className="mt-2 text-ink-300">{t(data.result.primaryLabelKey)}</p>
        )}

        <div className="mt-8 overflow-hidden rounded-card border border-ink-600">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.ogImage}
            alt={data.content.h1}
            width={1200}
            height={630}
            className="aspect-[1200/630] w-full bg-ink-850 object-cover"
          />
        </div>

        <Link
          href={data.calcHref}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent-fill px-6 py-3 font-semibold text-ink-950 transition-transform hover:scale-[1.03]"
        >
          {t("share.open")}
          <ArrowRightIcon size={18} />
        </Link>
        <p className="mt-4 text-sm text-ink-400">{t("share.note")}</p>
      </div>
    </Container>
  );
};

export default SharePage;
