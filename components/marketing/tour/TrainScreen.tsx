"use client";

import { CheckIcon, TimerIcon } from "@/components/icons";
import {
  MockCard,
  MockLabel,
  PhoneChrome,
} from "@/components/marketing/tour/PhoneChrome";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SETS = [
  { n: 1, kg: 80, reps: 6, done: true },
  { n: 2, kg: 80, reps: 6, done: true },
  { n: 3, kg: 80, reps: 5, done: false },
  { n: 4, kg: 80, reps: 6, done: false, dim: true },
];

/** Train tab: a program session, set logging with RIR, and the rest strip. */
export const TrainScreen = () => {
  const t = useT();
  return (
    <PhoneChrome tab="train" title={t("tour.mock.sessionTitle")}>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <MockLabel>{t("tour.mock.sessionMeta")}</MockLabel>
          <span className="font-mono text-[9px] text-ink-400">32:10</span>
        </div>

        <MockCard className="border-brand/25">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">{t("tour.mock.bench")}</p>
            <span className="rounded-md border border-ink-600 px-1.5 py-0.5 font-mono text-[9px] text-ink-300">
              4 × 6 · RIR 2
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {SETS.map((s) => (
              <div
                key={s.n}
                className={cn(
                  "grid grid-cols-[1.25rem_1fr_1fr_1.25rem] items-center gap-2 rounded-md px-2 py-1.5 font-mono text-[10px]",
                  s.done
                    ? "bg-brand/10 text-ink-100"
                    : s.dim
                      ? "text-ink-500"
                      : "border border-brand/50 bg-ink-900 text-ink-50",
                )}
              >
                <span className="text-ink-400">{s.n}</span>
                <span>
                  {s.kg} <span className="text-ink-400">kg</span>
                </span>
                <span>
                  {s.reps}{" "}
                  <span className="text-ink-400">{t("tour.mock.reps")}</span>
                </span>
                <span className="flex justify-end">
                  {s.done ? (
                    <CheckIcon size={12} className="text-brand" />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-ink-500" />
                  )}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[9px] text-ink-400">
            {t("tour.mock.lastTime")}: 77.5 × 6 · 6 · 6
          </p>
        </MockCard>

        <MockCard className="flex items-center gap-3 border-brand/40 bg-ink-850">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/40 bg-brand/10 text-brand">
            <TimerIcon size={16} />
          </span>
          <span className="flex-1">
            <MockLabel>{t("tour.mock.rest")}</MockLabel>
            <span className="font-mono text-xl font-bold text-ink-50">
              01:28
            </span>
          </span>
          <span className="flex gap-1 font-mono text-[9px]">
            <span className="rounded-md border border-ink-600 px-1.5 py-1 text-ink-300">
              −30
            </span>
            <span className="rounded-md border border-ink-600 px-1.5 py-1 text-ink-300">
              +30
            </span>
          </span>
        </MockCard>

        <div className="space-y-1">
          {[t("tour.mock.ohp"), t("tour.mock.row")].map((name, i) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-800/60 px-3 py-2 text-[10px] text-ink-300"
            >
              <span>{name}</span>
              <span className="font-mono text-ink-500">
                {i === 0 ? "3 × 10" : "3 × 8"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PhoneChrome>
  );
};
