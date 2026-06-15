"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SearchIcon } from "@/components/icons";
import { GlowCard } from "@/components/shared/GlowCard";
import { useT } from "@/lib/i18n";
import {
  CATEGORY_LABEL,
  DIFFICULTY_LABEL,
  EQUIPMENT_LABEL,
  EX_CATEGORIES,
  EX_EQUIPMENT,
  type Difficulty,
  type Equipment,
  type ExerciseCategory,
} from "@/lib/exercises/data";

export type ExerciseCard = {
  slug: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment;
  difficulty: Difficulty;
};

const selectClass =
  "h-10 rounded-lg border border-ink-600 bg-ink-800 px-3 text-sm text-ink-100 focus:border-lime-400/40 focus:ring-2 focus:ring-lime-400/20 focus:outline-none";

export const ExerciseGrid = ({
  items,
  basePath,
}: {
  items: ExerciseCard[];
  basePath: string;
}) => {
  const t = useT();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [equipment, setEquipment] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (e) =>
        (!q || e.name.toLowerCase().includes(q)) &&
        (!category || e.category === category) &&
        (!equipment || e.equipment === equipment),
    );
  }, [items, query, category, equipment]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon
            size={18}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("ex.searchPlaceholder")}
            aria-label={t("ex.searchPlaceholder")}
            className="h-10 w-full rounded-lg border border-ink-600 bg-ink-800 pr-3 pl-10 text-sm text-ink-50 placeholder:text-ink-400 focus:border-lime-400/40 focus:ring-2 focus:ring-lime-400/20 focus:outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label={t("ex.allCategories")}
          className={selectClass}
        >
          <option value="">{t("ex.allCategories")}</option>
          {EX_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(CATEGORY_LABEL[c])}
            </option>
          ))}
        </select>
        <select
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          aria-label={t("ex.allEquipment")}
          className={selectClass}
        >
          <option value="">{t("ex.allEquipment")}</option>
          {EX_EQUIPMENT.map((eq) => (
            <option key={eq} value={eq}>
              {t(EQUIPMENT_LABEL[eq])}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-ink-400">{t("ex.noResults")}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <Link
              key={e.slug}
              href={`${basePath}/${e.slug}`}
              className="block h-full"
            >
              <GlowCard className="flex h-full flex-col">
                <h2 className="text-base font-semibold text-ink-50">
                  {e.name}
                </h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-ink-700 px-2 py-0.5 text-xs text-ink-200">
                    {t(CATEGORY_LABEL[e.category])}
                  </span>
                  <span className="rounded-md bg-ink-700 px-2 py-0.5 text-xs text-ink-200">
                    {t(EQUIPMENT_LABEL[e.equipment])}
                  </span>
                  <span className="rounded-md border border-lime-400/25 bg-lime-400/10 px-2 py-0.5 text-xs text-accent">
                    {t(DIFFICULTY_LABEL[e.difficulty])}
                  </span>
                </div>
              </GlowCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
