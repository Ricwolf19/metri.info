"use client";

import { StepItem } from "@/components/roadmap/StepItem";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { type RoadmapStep, STAGES, type StepId } from "@/lib/roadmap/steps";

/** The roadmap's steps on one rail, grouped by stage, in the order to do
 * them. */
export const RoadmapTimeline = ({
  steps,
  docTitles,
  onToggle,
  onRetake,
}: {
  steps: RoadmapStep[];
  docTitles: Record<string, string>;
  onToggle: (id: StepId, done: boolean) => void;
  onRetake: () => void;
}) => {
  const t = useT();
  return (
    <div className="space-y-8">
      {STAGES.map((stage, i) => {
        const inStage = steps.filter((s) => s.stage === stage);
        if (inStage.length === 0) return null;
        const finished = inStage.every((s) => s.status === "done");
        return (
          <section key={stage} aria-labelledby={`roadmap-stage-${stage}`}>
            <h3
              id={`roadmap-stage-${stage}`}
              className="mb-3 flex items-baseline gap-2 text-sm font-semibold text-ink-100"
            >
              <span className="font-mono text-xs text-ink-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                {t(`roadmap.stage.${stage}` as TranslationKey)}
              </span>
              <span className="ml-auto shrink-0 font-mono text-xs font-normal text-ink-400">
                {inStage.filter((s) => s.status === "done").length}/
                {inStage.length}
              </span>
            </h3>
            <ol
              className={
                finished
                  ? "relative space-y-3 before:absolute before:top-4 before:bottom-4 before:left-[11px] before:w-0.5 before:bg-brand/40"
                  : "relative space-y-3 before:absolute before:top-4 before:bottom-4 before:left-[11px] before:w-0.5 before:bg-ink-700"
              }
            >
              {inStage.map((step) => (
                <StepItem
                  key={step.id}
                  step={step}
                  docTitles={docTitles}
                  onToggle={(done) => onToggle(step.id, done)}
                  onRetake={onRetake}
                />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
};
