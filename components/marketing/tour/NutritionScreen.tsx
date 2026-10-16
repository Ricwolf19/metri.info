"use client";

import {
  MockCard,
  MockLabel,
  PhoneChrome,
} from "@/components/marketing/tour/PhoneChrome";
import { C } from "@/lib/calculators/_shared";
import { useT } from "@/lib/i18n";

const MACROS = [
  {
    key: "calc.result.protein",
    have: 142,
    goal: 170,
    color: "rgb(var(--brand))",
  },
  { key: "calc.result.carbs", have: 190, goal: 250, color: C.blue },
  { key: "calc.result.fat", have: 55, goal: 70, color: C.amber },
] as const;

/** Nutrition tab: the day's energy ring, macro bars and the food diary. */
export const NutritionScreen = () => {
  const t = useT();
  const R = 26;
  const C = 2 * Math.PI * R;
  const frac = 1840 / 2260;
  const meals = [
    { name: t("tour.mock.breakfast"), kcal: 520 },
    { name: t("tour.mock.lunch"), kcal: 760 },
    { name: t("tour.mock.dinner"), kcal: 560 },
  ];
  return (
    <PhoneChrome tab="nutrition" title={t("tour.tab.nutrition")}>
      <div className="space-y-2.5">
        <MockCard className="flex items-center gap-3">
          <span className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={R}
                fill="none"
                stroke="rgb(var(--ink-700))"
                strokeWidth="6"
              />
              <circle
                cx="32"
                cy="32"
                r={R}
                fill="none"
                stroke="rgb(var(--brand))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${frac * C} ${C}`}
              />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-xs font-bold">1,840</span>
              <span className="text-[8px] text-ink-400">/ 2,260</span>
            </span>
          </span>
          <span className="min-w-0 flex-1 space-y-1.5">
            {MACROS.map((m) => (
              <span key={m.key} className="block">
                <span className="flex justify-between font-mono text-[9px] text-ink-300">
                  <span>{t(m.key)}</span>
                  <span>
                    {m.have}
                    <span className="text-ink-500"> / {m.goal} g</span>
                  </span>
                </span>
                <span className="mt-0.5 block h-1.5 overflow-hidden rounded-full bg-ink-700">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${(m.have / m.goal) * 100}%`,
                      background: m.color,
                    }}
                  />
                </span>
              </span>
            ))}
          </span>
        </MockCard>

        <div className="space-y-1.5">
          {meals.map((meal) => (
            <MockCard
              key={meal.name}
              className="flex items-center justify-between py-2.5"
            >
              <span className="text-xs font-medium">{meal.name}</span>
              <span className="font-mono text-[10px] text-ink-300">
                {meal.kcal} kcal
              </span>
            </MockCard>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-dashed border-ink-600 px-3 py-2.5 text-[10px] text-ink-400">
            <span>{t("tour.mock.snack")}</span>
            <span className="font-mono text-brand">+ {t("tour.mock.add")}</span>
          </div>
        </div>

        <MockCard className="bg-ink-850">
          <MockLabel>{t("tour.mock.sevenDay")}</MockLabel>
          <p className="mt-1 font-mono text-sm font-semibold">
            2,180{" "}
            <span className="text-[10px] text-ink-400">
              kcal · {t("tour.mock.avg")}
            </span>
          </p>
        </MockCard>
      </div>
    </PhoneChrome>
  );
};
