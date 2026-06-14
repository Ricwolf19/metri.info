"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ArrowRightIcon, SearchIcon } from "@/components/icons";
import { GlowCard } from "@/components/shared/GlowCard";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import type { DocCategory, DocMeta } from "@/lib/docs";

type CategoryInfo = { category: DocCategory; labelKey: TranslationKey };

export const DocsBrowser = ({
  docs,
  categories,
  basePath,
}: {
  docs: DocMeta[];
  categories: CategoryInfo[];
  basePath: string;
}) => {
  const t = useT();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) =>
      [d.title, d.description, ...(d.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [docs, query]);

  return (
    <div>
      <div className="relative mx-auto max-w-xl">
        <SearchIcon
          size={18}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-400"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("docs.searchPlaceholder")}
          aria-label={t("docs.searchPlaceholder")}
          className="h-12 w-full rounded-xl border border-ink-600 bg-ink-800 pr-4 pl-11 text-ink-50 placeholder:text-ink-400 focus:border-lime-400/40 focus:ring-2 focus:ring-lime-400/20 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-ink-400">{t("docs.noResults")}</p>
      ) : (
        <div className="mt-12 space-y-12">
          {categories.map(({ category, labelKey }) => {
            const items = filtered.filter((d) => d.category === category);
            if (items.length === 0) return null;
            return (
              <section key={category}>
                <h2 className="text-sm font-semibold tracking-wide text-ink-400 uppercase">
                  {t(labelKey)}
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`${basePath}/${doc.slug}`}
                      className="block h-full"
                    >
                      <GlowCard className="flex h-full flex-col">
                        <h3 className="text-lg font-semibold text-ink-50">
                          {doc.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm text-ink-300">
                          {doc.description}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                          {t("common.readMore")}
                          <ArrowRightIcon size={15} />
                        </span>
                      </GlowCard>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
