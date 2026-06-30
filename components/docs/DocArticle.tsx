import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { getMdxComponents } from "@/components/docs/MdxComponents";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { GlossaryView } from "@/components/glossary/GlossaryView";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { Container } from "@/components/shared/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import {
  CATEGORY_LABEL,
  DOC_CATEGORIES,
  getAllDocs,
  getDoc,
  getDocSiblings,
  getToc,
} from "@/lib/docs";
import {
  DOC_AUTHOR,
  DOC_LAST_REVIEWED,
  DOC_SOURCES,
  HEALTH_DOCS,
} from "@/lib/docs/sources";
import { absoluteUrl } from "@/lib/utils";

const categoryInfo = () =>
  DOC_CATEGORIES.map((category) => ({
    category,
    labelKey: CATEGORY_LABEL[category],
  }));

export const DocArticle = async ({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) => {
  const doc = getDoc(locale, slug);
  if (!doc) notFound();

  const t = createT(locale);
  const basePath = routePath("docs", locale);
  const toolsPath = routePath("tools", locale);
  const toc = getToc(doc.content);
  const { prev, next } = getDocSiblings(locale, slug);
  const allDocs = getAllDocs(locale);

  const isGlossary = doc.meta.category === "glossary";
  const docTitles = Object.fromEntries(allDocs.map((d) => [d.slug, d.title]));

  const sources = DOC_SOURCES[slug] ?? [];
  const isHealth = HEALTH_DOCS.has(slug);
  const reviewedDate = new Date(DOC_LAST_REVIEWED).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { content } = await compileMDX({
    source: doc.content,
    components: getMdxComponents(locale),
    options: {
      mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] },
    },
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      // Health/nutrition/recovery topics are YMYL → MedicalWebPage with a named
      // author/reviewer and a last-reviewed date. Training/intro stay Article.
      "@type": isHealth ? "MedicalWebPage" : "Article",
      headline: doc.meta.title,
      name: doc.meta.title,
      description: doc.meta.description,
      articleSection: t(CATEGORY_LABEL[doc.meta.category]),
      inLanguage: locale,
      isAccessibleForFree: true,
      lastReviewed: DOC_LAST_REVIEWED,
      dateModified: DOC_LAST_REVIEWED,
      author: { "@type": "Person", name: DOC_AUTHOR.name, url: DOC_AUTHOR.url },
      reviewedBy: {
        "@type": "Person",
        name: DOC_AUTHOR.name,
        url: DOC_AUTHOR.url,
      },
      publisher: { "@type": "Organization", name: "Metri" },
      mainEntityOfPage: absoluteUrl(`${basePath}/${slug}`),
      ...(sources.length > 0
        ? { citation: sources.map((s) => s.url ?? s.text) }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "Metri", url: routePath("home", locale) },
        { name: t("docs.title"), url: basePath },
        { name: doc.meta.title, url: `${basePath}/${slug}` },
      ].map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: absoluteUrl(item.url),
      })),
    },
  ];

  return (
    <Container className="py-12">
      <JsonLd data={jsonLd} />
      <div className="grid gap-10 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_220px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <DocsSidebar
              docs={allDocs}
              categories={categoryInfo()}
              basePath={basePath}
            />
          </div>
        </aside>

        <article className="min-w-0">
          <nav className="flex items-center gap-1.5 text-sm text-ink-400">
            <Link href={basePath} className="hover:text-ink-200">
              {t("docs.title")}
            </Link>
            <ChevronRightIcon size={14} />
            <span className="text-ink-300">
              {t(CATEGORY_LABEL[doc.meta.category])}
            </span>
          </nav>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance text-ink-50">
            {doc.meta.title}
          </h1>
          <p className="mt-3 text-lg text-ink-300">{doc.meta.description}</p>
          <p className="mt-2 font-mono text-xs text-ink-400">
            {t("docs.readingTime", { minutes: doc.meta.readingMinutes })}
          </p>
          <p className="mt-3 text-sm text-ink-400">
            {t("docs.reviewedBy")}{" "}
            <a
              href={DOC_AUTHOR.url}
              rel="author noreferrer noopener"
              target="_blank"
              className="font-medium text-ink-200 underline-offset-2 hover:text-accent hover:underline"
            >
              {DOC_AUTHOR.name}
            </a>
            <span className="px-1.5 text-ink-600">·</span>
            {t("docs.lastUpdated")}{" "}
            <time dateTime={DOC_LAST_REVIEWED}>{reviewedDate}</time>
          </p>

          {doc.meta.tags && doc.meta.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {doc.meta.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`${basePath}?q=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-ink-800 px-2.5 py-1 font-mono text-xs text-ink-400 transition-colors hover:bg-ink-700 hover:text-ink-200"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8">
            {isGlossary ? <GlossaryView docTitles={docTitles} /> : content}
          </div>

          {sources.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-ink-50">
                {t("docs.sourcesTitle")}
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

          <p className="mt-12 rounded-xl border border-ink-600 bg-ink-850 p-4 text-xs text-ink-400">
            {t("docs.disclaimer")}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`${basePath}/${prev.slug}`}
                className="group rounded-xl border border-ink-600 bg-ink-800 p-4 transition-colors hover:border-ink-500"
              >
                <span className="flex items-center gap-1 text-xs text-ink-400">
                  <ArrowLeftIcon size={13} /> {t("common.readMore")}
                </span>
                <span className="mt-1 block font-medium text-ink-50">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`${basePath}/${next.slug}`}
                className="group rounded-xl border border-ink-600 bg-ink-800 p-4 text-right transition-colors hover:border-ink-500"
              >
                <span className="flex items-center justify-end gap-1 text-xs text-ink-400">
                  {t("common.readMore")} <ArrowRightIcon size={13} />
                </span>
                <span className="mt-1 block font-medium text-ink-50">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-8">
            <TableOfContents items={toc} />
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
    </Container>
  );
};
