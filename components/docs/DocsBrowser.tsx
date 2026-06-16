"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  BookIcon,
  CalculatorIcon,
  DropletsIcon,
  DumbbellIcon,
  FlameIcon,
  HomeIcon,
  MoonIcon,
  SearchIcon,
  TrendingUpIcon,
} from "@/components/icons";
import { GlowCard } from "@/components/shared/GlowCard";
import { PinButton } from "@/components/shared/PinButton";
import { useFavoriteIds } from "@/lib/favorites/useFavorites";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import type { DocCategory, DocMeta } from "@/lib/docs";

type CategoryInfo = { category: DocCategory; labelKey: TranslationKey };

type IconType = typeof BookIcon;

/** Per-category icon for the compact doc cards. */
const CATEGORY_ICON: Record<DocCategory, IconType> = {
  "getting-started": HomeIcon,
  calculators: CalculatorIcon,
  nutrition: DropletsIcon,
  training: DumbbellIcon,
  recovery: MoonIcon,
  supplements: FlameIcon,
  progress: TrendingUpIcon,
  glossary: BookIcon,
};

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
  const pinned = useFavoriteIds("doc");

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
          className="h-12 w-full rounded-xl border border-ink-600 bg-ink-800 pr-4 pl-11 text-ink-50 placeholder:text-ink-400 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/40 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-ink-400">{t("docs.noResults")}</p>
      ) : (
        <div className="mt-10 space-y-10">
          {categories.map(({ category, labelKey }) => {
            const items = filtered.filter((d) => d.category === category);
            if (items.length === 0) return null;
            const Icon = CATEGORY_ICON[category];
            return (
              <section key={category}>
                <h2 className="text-sm font-semibold tracking-wide text-ink-400 uppercase">
                  {t(labelKey)}
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`${basePath}/${doc.slug}`}
                      className="block h-full"
                    >
                      <GlowCard className="flex h-full items-start gap-3.5 p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-700 text-accent">
                          <Icon size={20} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink-50">
                            {doc.title}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-ink-300">
                            {doc.description}
                          </span>
                        </span>
                        <PinButton
                          itemType="doc"
                          itemId={doc.slug}
                          initialPinned={pinned.has(doc.slug)}
                          className="-mt-1 -mr-1"
                        />
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
