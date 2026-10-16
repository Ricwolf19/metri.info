"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { ChevronRightIcon, SearchIcon } from "@/components/icons";
import { PinButton } from "@/components/shared/PinButton";
import { SideNav } from "@/components/ui/SideNav";
import { track } from "@/lib/analytics/track";
import type { DocMeta } from "@/lib/docs";
import {
  CATEGORY_ICON,
  type DocCategory,
  docsSectionId,
} from "@/lib/docs/categories";
import { useFavoriteIds } from "@/lib/favorites/useFavorites";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { textMatches } from "@/lib/search";

type CategoryInfo = { category: DocCategory; labelKey: TranslationKey };

/**
 * The docs index as a reference list, not a card grid: a category rail on the
 * left (the shared `SideNav`, anchor mode — a scrollable chip row on small
 * screens) and, on the right, one dense row per guide grouped under compact
 * category headers. Rows span the full width, so a category with one guide
 * takes one line instead of a third of a grid and a block of empty space.
 */
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
  const searchParams = useSearchParams();
  // Seed from `?q=` so a tag link from a doc page lands pre-filtered.
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const favorites = useFavoriteIds("doc");

  const filtered = useMemo(
    () =>
      docs.filter((d) =>
        textMatches(query, d.title, d.description, (d.tags ?? []).join(" ")),
      ),
    [docs, query],
  );

  const groups = categories
    .map(({ category, labelKey }) => ({
      category,
      labelKey,
      items: filtered.filter((d) => d.category === category),
    }))
    .filter((g) => g.items.length > 0);

  const railGroups = [
    {
      items: groups.map((g) => ({
        id: docsSectionId(g.category),
        href: `#${docsSectionId(g.category)}`,
        label: t(g.labelKey),
        icon: CATEGORY_ICON[g.category],
      })),
    },
  ];

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

      {groups.length === 0 ? (
        <p className="mt-12 text-center text-ink-400">{t("docs.noResults")}</p>
      ) : (
        <div className="mt-10 gap-10 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">
          <aside className="mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <SideNav
                groups={railGroups}
                mode="anchor"
                ariaLabel={t("docs.title")}
              />
            </div>
          </aside>

          <div className="space-y-10">
            {groups.map(({ category, labelKey, items }) => {
              const Icon = CATEGORY_ICON[category];
              return (
                <section
                  key={category}
                  id={docsSectionId(category)}
                  className="scroll-mt-24"
                >
                  <div className="flex items-center gap-2.5 px-1">
                    <Icon size={16} className="text-brand" />
                    <h2 className="text-sm font-semibold tracking-wide text-ink-200 uppercase">
                      {t(labelKey)}
                    </h2>
                    <span className="font-mono text-xs text-ink-500">
                      {items.length}
                    </span>
                  </div>
                  <ul className="mt-3 divide-y divide-ink-700 overflow-hidden rounded-card border border-ink-600 bg-ink-800">
                    {items.map((doc) => (
                      <li key={doc.slug} className="relative">
                        <Link
                          href={`${basePath}/${doc.slug}`}
                          onClick={() =>
                            track("doc_opened", { slug: doc.slug })
                          }
                          className="group flex items-center gap-4 py-3.5 pr-14 pl-4 transition-colors hover:bg-ink-750 focus-visible:bg-ink-750 focus-visible:outline-none sm:pr-16 sm:pl-5"
                        >
                          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-700 text-accent sm:flex">
                            <Icon size={18} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                              <span className="text-sm font-semibold text-ink-50">
                                {doc.title}
                              </span>
                              <span className="font-mono text-[11px] text-ink-500">
                                {t("docs.readingTime", {
                                  minutes: doc.readingMinutes,
                                })}
                              </span>
                            </span>
                            <span className="mt-0.5 line-clamp-2 block text-sm leading-relaxed text-ink-300 sm:line-clamp-1">
                              {doc.description}
                            </span>
                            {doc.tags && doc.tags.length > 0 && (
                              <span className="mt-1.5 hidden flex-wrap gap-1.5 md:flex">
                                {doc.tags.slice(0, 4).map((tag) => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setQuery(tag);
                                    }}
                                    className="rounded-full bg-ink-900/70 px-2 py-0.5 font-mono text-[10px] text-ink-400 transition-colors hover:bg-ink-700 hover:text-ink-200"
                                  >
                                    #{tag}
                                  </button>
                                ))}
                              </span>
                            )}
                          </span>
                          <ChevronRightIcon
                            size={16}
                            className="hidden shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-200 sm:block"
                          />
                        </Link>
                        <PinButton
                          itemType="doc"
                          itemId={doc.slug}
                          initialPinned={favorites.ids.has(doc.slug)}
                          loading={!favorites.ready}
                          className="absolute top-1/2 right-3 -translate-y-1/2"
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
