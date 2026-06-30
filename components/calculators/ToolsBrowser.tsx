"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CALC_ICONS } from "@/components/calculators/calcIcons";
import { SearchIcon } from "@/components/icons";
import { GlowCard } from "@/components/shared/GlowCard";
import { PinButton } from "@/components/shared/PinButton";
import { useFavoriteIds } from "@/lib/favorites/useFavorites";
import { useT } from "@/lib/i18n";
import type { CalcRouteId } from "@/lib/i18n/routes";
import { textMatches } from "@/lib/search";

export type ToolCard = {
  id: CalcRouteId;
  href: string;
  title: string;
  tagline: string;
  keywords: string;
  popular: boolean;
  tags: string[];
};

export const ToolsBrowser = ({ cards }: { cards: ToolCard[] }) => {
  const t = useT();
  const [query, setQuery] = useState("");
  const pinned = useFavoriteIds("calculator");

  const filtered = useMemo(
    () =>
      cards.filter((c) =>
        textMatches(query, c.title, c.tagline, c.keywords, c.tags.join(" ")),
      ),
    [cards, query],
  );

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
          placeholder={t("tools.searchPlaceholder")}
          aria-label={t("tools.searchPlaceholder")}
          className="h-12 w-full rounded-xl border border-ink-600 bg-ink-800 pr-4 pl-11 text-ink-50 placeholder:text-ink-400 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/40 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-ink-400">{t("tools.noResults")}</p>
      ) : (
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const Icon = CALC_ICONS[c.id];
            return (
              <Link key={c.id} href={c.href} className="block h-full">
                <GlowCard className="flex h-full items-start gap-3.5 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-700 text-accent">
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="block text-sm font-semibold text-ink-50">
                        {c.title}
                      </span>
                      {c.popular && (
                        <span
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink-950/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ink-950 dark:bg-lime-400/10 dark:text-lime-400"
                          aria-label={t("tools.popularAria")}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-ink-950 dark:bg-lime-400" />
                          {t("tools.popular")}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-ink-300">
                      {c.tagline}
                    </span>
                    {c.tags.length > 0 && (
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {c.tags.slice(0, 3).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuery(tag);
                            }}
                            className="rounded-full bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-ink-400 transition-colors hover:bg-ink-700 hover:text-ink-200"
                          >
                            #{tag}
                          </button>
                        ))}
                      </span>
                    )}
                  </span>
                  <PinButton
                    itemType="calculator"
                    itemId={c.id}
                    initialPinned={pinned.has(c.id)}
                    className="-mt-1 -mr-1"
                  />
                </GlowCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
