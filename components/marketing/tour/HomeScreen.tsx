"use client";

import {
  CalculatorIcon,
  DumbbellIcon,
  PlusIcon,
  ScaleIcon,
} from "@/components/icons";
import {
  MockCard,
  MockLabel,
  PhoneChrome,
} from "@/components/marketing/tour/PhoneChrome";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const WEEK = [true, true, false, true, true, false, false];

/** Home tab: energy card, week strip, next session and pinned quick actions. */
export const HomeScreen = () => {
  const t = useT();
  const days = t("tour.mock.weekdays").split(",");
  return (
    <PhoneChrome tab="home" title={t("tour.mock.greeting")}>
      <div className="space-y-2.5">
        <MockCard className="relative overflow-hidden border-brand/25">
          <div
            aria-hidden
            className="glow-brand absolute inset-x-0 top-0 h-16"
          />
          <div className="relative">
            <MockLabel>{t("tour.mock.energy")}</MockLabel>
            <p className="mt-1 font-mono text-2xl font-bold text-brand">
              2,759 <span className="text-xs text-ink-300">kcal</span>
            </p>
            <p className="mt-0.5 text-[10px] text-ink-300">
              {t("tour.mock.phase")}
            </p>
          </div>
        </MockCard>

        <MockCard>
          <div className="flex items-center justify-between">
            <MockLabel>{t("tour.mock.thisWeek")}</MockLabel>
            <span className="font-mono text-[9px] text-brand">
              4/5 · {t("tour.mock.streak", { days: 12 })}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {WEEK.map((done, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="font-mono text-[8px] text-ink-400">
                  {days[i]}
                </span>
                <span
                  className={cn(
                    "h-6 w-full rounded-md",
                    done
                      ? "bg-brand"
                      : i === 4
                        ? "border border-brand/60"
                        : "bg-ink-700",
                  )}
                />
              </div>
            ))}
          </div>
        </MockCard>

        <MockCard className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/30 bg-brand/10 text-brand">
            <DumbbellIcon size={15} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold">
              {t("tour.mock.nextSession")}
            </span>
            <span className="block text-[10px] text-ink-400">
              {t("tour.mock.nextSessionMeta")}
            </span>
          </span>
          <span className="rounded-full bg-brand px-2 py-1 font-mono text-[9px] font-semibold text-brand-contrast">
            {t("tour.mock.start")}
          </span>
        </MockCard>

        <div>
          <MockLabel>{t("tour.mock.quickActions")}</MockLabel>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {[
              { icon: ScaleIcon, label: t("tour.mock.weighIn") },
              { icon: PlusIcon, label: t("tour.mock.logFood") },
              { icon: CalculatorIcon, label: t("tour.mock.calculators") },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex flex-col items-center gap-1 rounded-lg border border-ink-600/70 bg-ink-800 px-1 py-2 text-center text-[9px] text-ink-200"
              >
                <Icon size={14} className="text-accent" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </PhoneChrome>
  );
};
