"use client";

import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { formatDay } from "@/lib/roadmap/format";
import type { PastPlan } from "@/lib/roadmap/state";
import type { RoadmapStep } from "@/lib/roadmap/steps";

/** "What you've done": this plan's finished steps, newest first, down to the
 * day it started, then the plans before it. */
export const RoadmapHistory = ({
  steps,
  startedAt,
  history,
}: {
  steps: RoadmapStep[];
  startedAt: string;
  history: PastPlan[];
}) => {
  const { t, locale } = useI18n();
  const done = steps
    .filter((s): s is RoadmapStep & { doneAt: string } => s.doneAt !== null)
    .sort((a, b) => b.doneAt.localeCompare(a.doneAt));
  const entries = [
    ...done.map((s) => ({
      key: s.id,
      at: s.doneAt,
      label: t(`roadmap.step.${s.id}` as TranslationKey),
    })),
    { key: "start", at: startedAt, label: t("roadmap.history.started") },
  ];

  return (
    <section
      aria-labelledby="roadmap-history"
      className="rounded-card border border-ink-600 bg-ink-800 p-5"
    >
      <h2 id="roadmap-history" className="text-sm font-semibold text-ink-50">
        {t("roadmap.history.title")}
      </h2>
      {done.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-ink-400">
          {t("roadmap.history.empty")}
        </p>
      ) : null}
      <ol className="mt-3 space-y-2">
        {entries.map((e) => (
          <li key={e.key} className="flex min-w-0 items-baseline gap-3">
            <span className="w-14 shrink-0 font-mono text-xs text-ink-400">
              {formatDay(e.at, locale)}
            </span>
            <span
              className="min-w-0 truncate text-sm text-ink-200"
              title={e.label}
            >
              {e.label}
            </span>
          </li>
        ))}
      </ol>
      {history.length > 0 ? (
        <>
          <h3 className="mt-5 border-t border-ink-700 pt-4 text-xs font-semibold tracking-wide text-ink-300 uppercase">
            {t("roadmap.history.past")}
          </h3>
          <ul className="mt-2 space-y-2">
            {history.map((h) => (
              <li
                key={h.startedAt}
                className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 text-sm"
              >
                <span className="font-medium text-ink-100">
                  {t(`roadmap.phase.${h.phase}` as TranslationKey)}
                </span>
                <span className="font-mono text-xs text-ink-400">
                  {formatDay(h.startedAt, locale)} –{" "}
                  {formatDay(h.endedAt, locale)}
                  {" · "}
                  {t("roadmap.history.pastLine", {
                    done: String(h.done),
                    total: String(h.total),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
};
