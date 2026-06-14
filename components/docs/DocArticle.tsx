import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { mdxComponents } from "@/components/docs/MdxComponents";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { Container } from "@/components/shared/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { getT } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import {
  CATEGORY_LABEL,
  DOC_CATEGORIES,
  getAllDocs,
  getDoc,
  getDocSiblings,
  getToc,
} from "@/lib/docs";
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

  const t = await getT();
  const basePath = routePath("docs", locale);
  const toc = getToc(doc.content);
  const { prev, next } = getDocSiblings(locale, slug);
  const allDocs = getAllDocs(locale);

  const { content } = await compileMDX({
    source: doc.content,
    components: mdxComponents,
    options: {
      mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] },
    },
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: doc.meta.title,
      description: doc.meta.description,
      articleSection: t(CATEGORY_LABEL[doc.meta.category]),
      inLanguage: locale,
      isAccessibleForFree: true,
      author: { "@type": "Organization", name: "METRI" },
      publisher: { "@type": "Organization", name: "METRI" },
      mainEntityOfPage: absoluteUrl(`${basePath}/${slug}`),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "METRI", url: routePath("home", locale) },
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
      <div className="grid gap-10 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_200px]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <DocsSidebar
              docs={allDocs}
              categories={categoryInfo()}
              basePath={basePath}
            />
          </div>
        </aside>

        {/* Article */}
        <article className="min-w-0">
          <nav className="flex items-center gap-2 text-sm text-ink-400">
            <Link href={basePath} className="hover:text-ink-200">
              {t("docs.title")}
            </Link>
            <span>/</span>
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

          <div className="mt-8">{content}</div>

          <p className="mt-12 rounded-xl border border-ink-600 bg-ink-850 p-4 text-xs text-ink-400">
            {t("docs.disclaimer")}
          </p>

          {/* Prev / next */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`${basePath}/${prev.slug}`}
                className="group rounded-xl border border-ink-600 bg-ink-800 p-4 transition-colors hover:border-lime-400/40"
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
                className="group rounded-xl border border-ink-600 bg-ink-800 p-4 text-right transition-colors hover:border-lime-400/40"
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

        {/* TOC */}
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <TableOfContents items={toc} />
          </div>
        </aside>
      </div>
    </Container>
  );
};
