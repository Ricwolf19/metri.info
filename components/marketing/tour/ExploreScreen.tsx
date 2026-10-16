"use client";

import {
  BookIcon,
  CalculatorIcon,
  DropletsIcon,
  DumbbellIcon,
  HeartIcon,
  type IconProps,
  MedalIcon,
  SearchIcon,
} from "@/components/icons";
import {
  MockCard,
  MockLabel,
  PhoneChrome,
} from "@/components/marketing/tour/PhoneChrome";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";

const TOOLS: { icon: React.ComponentType<IconProps>; key: TranslationKey }[] = [
  { icon: DumbbellIcon, key: "tools.onerm.title" },
  { icon: HeartIcon, key: "tools.bmr.title" },
  { icon: CalculatorIcon, key: "tools.macros.title" },
  { icon: DropletsIcon, key: "tools.bodyfat.title" },
];

/** Explore tab: search, topics, calculators, guides and the knowledge check. */
export const ExploreScreen = () => {
  const t = useT();
  const topics = t("tour.mock.topics").split(",");
  return (
    <PhoneChrome tab="explore" title={t("tour.tab.explore")}>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-800 px-3 py-2 text-[10px] text-ink-400">
          <SearchIcon size={13} />
          {t("tour.mock.search")}
        </div>
        <div className="flex gap-1.5 overflow-hidden">
          {topics.map((topic, i) => (
            <span
              key={topic}
              className={
                i === 0
                  ? "rounded-full bg-brand px-2.5 py-1 font-mono text-[9px] font-semibold text-brand-contrast"
                  : "rounded-full border border-ink-600 px-2.5 py-1 font-mono text-[9px] text-ink-300"
              }
            >
              {topic}
            </span>
          ))}
        </div>

        <div>
          <MockLabel>{t("tour.mock.calculators")}</MockLabel>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {TOOLS.map(({ icon: Icon, key }) => (
              <MockCard key={key} className="flex items-center gap-2 p-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-700 text-accent">
                  <Icon size={13} />
                </span>
                <span className="truncate text-[10px] font-medium">
                  {t(key)}
                </span>
              </MockCard>
            ))}
          </div>
        </div>

        <div>
          <MockLabel>{t("tour.mock.guides")}</MockLabel>
          <div className="mt-1.5 space-y-1">
            {[t("tour.mock.guide1"), t("tour.mock.guide2")].map((g) => (
              <div
                key={g}
                className="flex items-center gap-2 rounded-lg border border-ink-600/60 bg-ink-800/60 px-3 py-2 text-[10px] text-ink-200"
              >
                <BookIcon size={12} className="text-ink-400" />
                <span className="truncate">{g}</span>
              </div>
            ))}
          </div>
        </div>

        <MockCard className="flex items-center gap-2.5 border-brand/25">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <MedalIcon size={15} />
          </span>
          <span className="flex-1">
            <span className="block text-xs font-semibold">
              {t("tour.mock.quiz")}
            </span>
            <span className="block text-[10px] text-ink-400">
              {t("tour.mock.quizMeta")}
            </span>
          </span>
        </MockCard>
      </div>
    </PhoneChrome>
  );
};
