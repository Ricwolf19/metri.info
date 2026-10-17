import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { QuizRadar } from "@/components/quiz/QuizRadar";
import { CATEGORY_LABEL, docsSectionId } from "@/lib/docs/categories";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import {
  areaLabels,
  LEVEL_KEY,
  QUIZ_AREAS,
  QUIZ_MAX_LEVEL,
  toQuizLevel,
} from "@/lib/quiz/areas";
import { QUIZ_QUESTIONS } from "@/lib/quiz/content";
import { missedQuestion, type QuizMiss } from "@/lib/quiz/engine";
import { AREA_DOCS, studyPlan } from "@/lib/quiz/recommend";
import type { QuizScores } from "@/lib/quiz/scores";
import { cn } from "@/lib/utils";

/**
 * A finished knowledge map: the radar, the level per area, and where to read
 * next. No hooks, so the quiz flow (client) and the activity page (server)
 * render the very same component. `children` is the action row.
 */
export const QuizResult = ({
  locale,
  scores,
  misses = [],
  compact = false,
  children,
}: {
  locale: Locale;
  scores: QuizScores;
  /** Missed cells from that attempt; renders a "review these" list. */
  misses?: QuizMiss[];
  compact?: boolean;
  children?: React.ReactNode;
}) => {
  const t = createT(locale);
  const labels = areaLabels(t);
  const plan = studyPlan(scores);
  const docsHref = routePath("docs", locale);
  const review = misses.flatMap((m) => {
    const q = missedQuestion(m, QUIZ_QUESTIONS);
    return q ? [{ miss: m, question: q }] : [];
  });

  return (
    <div>
      <div
        className={cn(
          "grid items-center gap-8",
          compact ? "sm:grid-cols-[14rem_1fr]" : "lg:grid-cols-[17rem_1fr]",
        )}
      >
        <QuizRadar
          scores={scores}
          labels={labels}
          className={cn("mx-auto", compact && "max-w-[14rem]")}
        />
        <ul className="space-y-3">
          {QUIZ_AREAS.map((area) => {
            const level = scores[area];
            return (
              <li key={area}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-ink-50">
                    {labels[area]}
                  </span>
                  <span className="font-mono text-xs text-ink-300">
                    {t("quiz.levelOf", {
                      level: t(LEVEL_KEY[level]),
                      n: level,
                    })}
                  </span>
                </div>
                <div className="mt-1.5 grid grid-cols-4 gap-1" aria-hidden>
                  {Array.from({ length: QUIZ_MAX_LEVEL }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "chart-anim h-1.5 rounded-full",
                        i < level ? "bg-brand" : "bg-ink-700",
                      )}
                    />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 rounded-field border border-ink-600/70 bg-ink-900/60 p-4 sm:p-5">
        <p className="font-mono text-[11px] font-medium tracking-widest text-ink-400 uppercase">
          {t("quiz.studyTitle")}
        </p>
        {plan.length === 0 ? (
          <p className="mt-2 text-sm text-ink-200">{t("quiz.studyAllClear")}</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {plan.map(({ area, cleared }) => {
              const category = AREA_DOCS[area];
              return (
                <li key={area}>
                  <Link
                    href={`${docsHref}#${docsSectionId(category)}`}
                    className="group flex items-center gap-3 rounded-field border border-ink-600/70 bg-ink-800 px-3 py-2.5 transition-colors hover:border-brand/40"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink-50">
                        {t("quiz.studyGuides", { area: labels[area] })}
                      </span>
                      <span className="block text-xs text-ink-400">
                        {t(CATEGORY_LABEL[category])} ·{" "}
                        {t(LEVEL_KEY[toQuizLevel(cleared)])}
                      </span>
                    </span>
                    <ArrowRightIcon
                      size={16}
                      className="shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {review.length > 0 && (
        <div className="mt-4 rounded-field border border-ink-600/70 bg-ink-900/60 p-4 sm:p-5">
          <p className="font-mono text-[11px] font-medium tracking-widest text-ink-400 uppercase">
            {t("quiz.review")}
          </p>
          <p className="mt-1 text-xs text-ink-400">{t("quiz.reviewHint")}</p>
          <ul className="mt-3 divide-y divide-ink-700">
            {review.map(({ miss, question }) => (
              <li key={`${miss.area}-${miss.level}`} className="py-3">
                <p className="text-sm font-medium text-ink-50">
                  {question.prompt[locale]}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-300">
                  {question.why[locale]}
                </p>
                <Link
                  href={`${docsHref}#${docsSectionId(AREA_DOCS[miss.area])}`}
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                >
                  {t("quiz.studyGuides", { area: labels[miss.area] })}
                  <ArrowRightIcon size={12} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {children}
    </div>
  );
};
