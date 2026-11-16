"use client";

import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import type { Plan } from "@/lib/roadmap/recommend";
import type { RoadmapStep, Schedule } from "@/lib/roadmap/steps";
import { cn } from "@/lib/utils";

/** Where you are, at a glance: the phase, the week, how many steps are
 * done, and the one step to do next (a jump to it on the timeline). */
export const RoadmapOverview = ({
  plan,
  steps,
  schedule,
  className,
}: {
  plan: Plan;
  steps: RoadmapStep[];
  schedule: Schedule;
  className?: string;
}) => {
  const t = useT();
  const done = steps.filter((s) => s.status === "done").length;
  const current = steps.find((s) => s.status === "current");
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;

  return (
    <section
      aria-labelledby="roadmap-overview"
      className={cn(
        "min-w-0 rounded-card border border-ink-600 bg-ink-800 p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 id="roadmap-overview" className="text-lg font-semibold text-ink-50">
          {t(`roadmap.phase.${plan.phase}` as TranslationKey)}
        </h2>
        <span className="rounded-full border border-brand/40 px-2 py-0.5 font-mono text-[11px] tracking-wide whitespace-nowrap text-brand uppercase">
          {t("roadmap.weekOf", {
            week: String(schedule.week),
            total: String(schedule.totalWeeks),
          })}
        </span>
        <span className="ml-auto font-mono text-xs whitespace-nowrap text-ink-400">
          {t("roadmap.progress", {
            done: String(done),
            total: String(steps.length),
          })}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={t("roadmap.progress", {
          done: String(done),
          total: String(steps.length),
        })}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-700"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-4 rounded-field border border-ink-700 bg-ink-850 px-4 py-3">
        <p className="font-mono text-[11px] tracking-wide text-ink-400 uppercase">
          {t("roadmap.next")}
        </p>
        {current ? (
          <a
            href={`#step-${current.id}`}
            className="mt-0.5 block text-sm font-medium [overflow-wrap:anywhere] text-ink-50 hover:text-brand"
          >
            {t(`roadmap.step.${current.id}` as TranslationKey)} →
          </a>
        ) : (
          <p className="mt-0.5 text-sm text-ink-200">{t("roadmap.allDone")}</p>
        )}
      </div>
    </section>
  );
};
