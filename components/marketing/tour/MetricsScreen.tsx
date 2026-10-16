"use client";

import { FlameIcon, TrendingUpIcon } from "@/components/icons";
import {
  MockCard,
  MockLabel,
  PhoneChrome,
} from "@/components/marketing/tour/PhoneChrome";
import { useT } from "@/lib/i18n";

const VOLUME = [42, 60, 55, 78, 70, 92, 84];
const WEIGHT = [82.4, 82.1, 81.9, 81.6, 81.5, 81.1, 80.9];

const sparkPath = (values: number[], w: number, h: number) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 6) - 3;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

/** Metrics tab: streak, weekly volume, body-weight trend and e1RM gains. */
export const MetricsScreen = () => {
  const t = useT();
  return (
    <PhoneChrome tab="metrics" title={t("tour.tab.metrics")}>
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <MockCard>
            <MockLabel>{t("tour.mock.streakLabel")}</MockLabel>
            <p className="mt-1 flex items-center gap-1 font-mono text-xl font-bold">
              <FlameIcon size={16} className="text-flame" />
              12
            </p>
          </MockCard>
          <MockCard>
            <MockLabel>{t("tour.mock.sessions")}</MockLabel>
            <p className="mt-1 font-mono text-xl font-bold">
              48 <span className="text-[10px] text-ink-400">/ 12 wk</span>
            </p>
          </MockCard>
        </div>

        <MockCard>
          <MockLabel>{t("tour.mock.weeklyVolume")}</MockLabel>
          <div className="mt-2 flex h-14 items-end gap-1">
            {VOLUME.map((v, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm bg-brand"
                style={{
                  height: `${v}%`,
                  opacity: 0.35 + (i / VOLUME.length) * 0.65,
                }}
              />
            ))}
          </div>
          <p className="mt-1.5 font-mono text-[9px] text-brand">
            +14% {t("tour.mock.vsLastWeek")}
          </p>
        </MockCard>

        <MockCard>
          <div className="flex items-center justify-between">
            <MockLabel>{t("tour.mock.bodyWeight")}</MockLabel>
            <span className="font-mono text-[10px] text-ink-50">
              80.9 <span className="text-ink-400">kg</span>
            </span>
          </div>
          <svg viewBox="0 0 200 44" className="mt-2 h-11 w-full" fill="none">
            <path
              d={sparkPath(WEIGHT, 200, 44)}
              stroke="rgb(var(--brand))"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="font-mono text-[9px] text-ink-400">
            −1.5 kg · {t("tour.mock.weeklyAvg")}
          </p>
        </MockCard>

        <MockCard className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-700 text-brand">
            <TrendingUpIcon size={15} />
          </span>
          <span className="flex-1">
            <span className="block text-xs font-semibold">
              {t("tour.mock.bench")} e1RM
            </span>
            <span className="block text-[10px] text-ink-400">
              {t("tour.mock.threeMonths")}
            </span>
          </span>
          <span className="font-mono text-sm font-bold text-brand">+8 kg</span>
        </MockCard>
      </div>
    </PhoneChrome>
  );
};
