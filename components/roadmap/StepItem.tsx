"use client";

import { CheckIcon } from "@/components/icons";
import { StepLinks } from "@/components/roadmap/StepLinks";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { formatDay } from "@/lib/roadmap/format";
import type { RoadmapStep } from "@/lib/roadmap/steps";
import { cn } from "@/lib/utils";

/**
 * One step on the timeline: a marker on the rail (done, you-are-here or to
 * do), what to do and why, its links, and the action. Only the person ticks
 * a step, so a ticked one can always be unticked.
 */
export const StepItem = ({
  step,
  docTitles,
  onToggle,
  onRetake,
}: {
  step: RoadmapStep;
  docTitles: Record<string, string>;
  onToggle: (done: boolean) => void;
  onRetake: () => void;
}) => {
  const { t, locale } = useI18n();
  const current = step.status === "current";
  const done = step.status === "done";

  return (
    <li id={`step-${step.id}`} className="relative scroll-mt-24 pl-9">
      <span
        aria-hidden
        className={cn(
          "absolute top-4 left-0 flex size-6 items-center justify-center rounded-full border-2",
          done && "border-brand bg-brand text-brand-contrast",
          current && "border-brand bg-ink-900",
          !done && !current && "border-ink-600 bg-ink-900",
        )}
      >
        {done ? <CheckIcon size={13} /> : null}
        {current ? (
          <span className="size-2 animate-pulse rounded-full bg-brand" />
        ) : null}
      </span>
      <div
        className={cn(
          "min-w-0 rounded-card border p-4",
          current ? "border-brand/50 bg-brand/5" : "border-ink-700 bg-ink-800",
        )}
      >
        {current ? (
          <p className="mb-1 font-mono text-[11px] tracking-wide text-brand uppercase">
            {t("roadmap.youAreHere")}
          </p>
        ) : null}
        <h4
          className={cn(
            "text-sm font-semibold [overflow-wrap:anywhere]",
            done ? "text-ink-300" : "text-ink-50",
          )}
        >
          {t(`roadmap.step.${step.id}` as TranslationKey)}
        </h4>
        <p className="mt-1 text-sm leading-relaxed text-ink-400">
          {t(`roadmap.step.${step.id}.body` as TranslationKey)}
        </p>
        <StepLinks links={step.links} docTitles={docTitles} />
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          {done && step.doneAt ? (
            <span className="text-xs text-ink-400">
              {t("roadmap.doneOn", { date: formatDay(step.doneAt, locale) })}
            </span>
          ) : null}
          {done ? (
            <button
              type="button"
              onClick={() => onToggle(false)}
              className="text-xs font-medium text-ink-400 underline underline-offset-2 hover:text-ink-100"
            >
              {t("roadmap.undo")}
            </button>
          ) : null}
          {!done && step.id === "reassess" ? (
            <Button
              type="button"
              size="sm"
              variant={current ? "brand" : "outline"}
              onClick={onRetake}
            >
              {t("roadmap.retake")}
            </Button>
          ) : null}
          {!done && step.id !== "reassess" ? (
            <Button
              type="button"
              size="sm"
              variant={current ? "brand" : "outline"}
              onClick={() => onToggle(true)}
            >
              {t("roadmap.markDone")}
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
};
