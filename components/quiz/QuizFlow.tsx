"use client";

import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AppleIcon,
  BookIcon,
  CheckIcon,
  DumbbellIcon,
  type IconProps,
  RefreshIcon,
  ScaleIcon,
  XIcon,
} from "@/components/icons";
import { QuizResult } from "@/components/quiz/QuizResult";
import { ShareResultDialog } from "@/components/shared/ShareResultDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { saveQuizAttempt } from "@/app/quiz/actions";
import { track } from "@/lib/analytics/track";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import {
  AREA_KEY,
  LEVEL_KEY,
  QUIZ_AREAS,
  QUIZ_MAX_LEVEL,
  type QuizArea,
  toQuizLevel,
} from "@/lib/quiz/areas";
import { QUIZ_QUESTIONS } from "@/lib/quiz/content";
import {
  answerCurrent,
  areaDone,
  currentArea,
  currentQuestion,
  isQuizComplete,
  levelOutcome,
  maxRemaining,
  optionOrderFor,
  QUESTIONS_PER_CELL,
  QUIZ_LENGTH,
  type QuizState,
  startQuiz,
} from "@/lib/quiz/engine";
import {
  encodeScores,
  type QuizScores,
  readLocalResult,
  type StoredResult,
  toQuizScores,
  writeLocalResult,
} from "@/lib/quiz/scores";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const LETTERS = ["A", "B", "C", "D"];

const AREA_ICON: Record<QuizArea, React.ComponentType<IconProps>> = {
  nutrition: AppleIcon,
  training: DumbbellIcon,
  body: ScaleIcon,
  fundamentals: BookIcon,
};

type Phase = "intro" | "question" | "result";
type SaveState = "saved" | "local" | "failed" | null;

/** Four tiny ladders, one per area: cleared levels in brand, a missed level
 * dimmed, a half-answered or current level glowing. Reads as "where am I"
 * at a glance. */
const AreaLadder = ({
  state,
  labels,
}: {
  state: QuizState;
  labels: Record<QuizArea, string>;
}) => {
  const active = currentArea(state);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-hidden>
      {QUIZ_AREAS.map((area) => {
        const Icon = AREA_ICON[area];
        const closed = areaDone(state, area);
        return (
          <li key={area}>
            <div className="grid grid-cols-4 gap-0.5">
              {Array.from({ length: QUIZ_MAX_LEVEL }).map((_, i) => {
                const outcome = levelOutcome(state, area, i + 1);
                return (
                  <span
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-colors",
                      outcome === true
                        ? "bg-brand"
                        : outcome === false
                          ? "bg-ink-500/50"
                          : outcome === "open" ||
                              (area === active && i === state.current[area] - 1)
                            ? "bg-brand/40"
                            : "bg-ink-700",
                    )}
                  />
                );
              })}
            </div>
            <p
              className={cn(
                "mt-1.5 flex items-center gap-1 truncate font-mono text-[10px] tracking-wide uppercase",
                area === active
                  ? "text-brand"
                  : closed
                    ? "text-ink-500"
                    : "text-ink-400",
              )}
            >
              <Icon size={11} className="shrink-0" />
              <span className="truncate">{labels[area]}</span>
            </p>
          </li>
        );
      })}
    </ol>
  );
};

/**
 * The knowledge check, start to finish: intro (with a shared map and the
 * reader's last result when they exist), one question at a time with an
 * explanation after every answer, then the map. It never moves on by itself:
 * the reader reads the explanation and presses Next. Anyone can take it; the
 * result always stays in this browser, a signed-in account also keeps it as
 * history. On phones the progress and Next live in a bar pinned to the
 * bottom. Must sit inside a `MotionProvider`.
 */
export const QuizFlow = ({
  initial,
  shared,
  canSave,
  signedIn,
}: {
  /** The account's latest saved attempt, if any. */
  initial: StoredResult | null;
  /** A result decoded from a share link (`?r=`). */
  shared: QuizScores | null;
  canSave: boolean;
  signedIn: boolean;
}) => {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("intro");
  const [last, setLast] = useState<StoredResult | null>(initial);
  const [state, setState] = useState<QuizState>(() =>
    startQuiz(QUIZ_QUESTIONS, () => 0),
  );
  const [picked, setPicked] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<SaveState>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  // Set when a new prompt should take focus; the prompt's ref honours it.
  const focusPrompt = useRef(false);
  // "I don't know" unmounts itself, so its focus moves on to Next.
  const focusNext = useRef(false);

  const labels = Object.fromEntries(
    QUIZ_AREAS.map((a) => [a, t(AREA_KEY[a])]),
  ) as Record<QuizArea, string>;

  // The browser's memory of the last result is the signed-out "history".
  useEffect(() => {
    if (initial) return;
    const stored = readLocalResult();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setLast(stored);
  }, [initial]);

  const question = currentQuestion(state, QUIZ_QUESTIONS);
  const area = currentArea(state);
  const revealed = picked !== null;
  const remaining = maxRemaining(state);
  const attemptPct =
    state.asked + remaining > 0
      ? Math.round((state.asked / (state.asked + remaining)) * 100)
      : 0;

  const finish = async (final: QuizState) => {
    const scores: QuizScores = toQuizScores(final.cleared);
    writeLocalResult(scores, final.misses);
    setLast({ scores, at: new Date().toISOString(), misses: final.misses });
    setPhase("result");
    track("quiz_completed", { asked: final.asked });
    if (!canSave) {
      setSaveState("local");
      return;
    }
    const res = await saveQuizAttempt({
      scores,
      asked: final.asked,
      misses: final.misses,
    });
    if (res.ok) {
      setSaveState("saved");
      toast({ title: t("quiz.saved"), variant: "success" });
    } else {
      setSaveState("failed");
      toast({ title: t("quiz.saveFailed"), variant: "error" });
    }
  };

  const advance = () => {
    if (picked === null || !question) return;
    const next = answerCurrent(state, picked === question.answer);
    setPicked(null);
    setState(next);
    if (isQuizComplete(next)) void finish(next);
  };

  // Move focus to the new prompt so a screen reader announces it and the next
  // Tab lands on its options, not back at the top of the page. Under
  // `AnimatePresence mode="wait"` the previous card is still mounted when the
  // question changes, so a prompt that is not the current one waits for its
  // successor's ref (`promptRef`) instead of being focused on its way out.
  useEffect(() => {
    if (phase !== "question") return;
    const node = headingRef.current;
    if (node && node.dataset.asked === String(state.asked)) {
      focusPrompt.current = false;
      node.focus({ preventScroll: true });
    } else {
      focusPrompt.current = true;
    }
  }, [phase, state.asked]);

  const promptRef = useCallback((node: HTMLHeadingElement | null) => {
    headingRef.current = node;
    if (node && focusPrompt.current) {
      focusPrompt.current = false;
      node.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    if (!revealed || !focusNext.current) return;
    focusNext.current = false;
    // Two Next buttons (desktop panel, phone bar); focus the one on screen.
    const next = [
      ...document.querySelectorAll<HTMLElement>("[data-quiz-next]"),
    ].find((el) => el.offsetParent !== null);
    next?.focus();
  }, [revealed]);

  const begin = () => {
    setState(startQuiz(QUIZ_QUESTIONS));
    setPicked(null);
    setSaveState(null);
    setPhase("question");
    track("quiz_started");
  };

  const pick = (index: number) => {
    if (revealed) return;
    if (index === -1) focusNext.current = true;
    setPicked(index);
  };

  const shareLinks = (scores: QuizScores) => () => {
    const { origin } = window.location;
    const code = encodeScores(scores);
    return {
      url: `${origin}${routePath("quizResult", locale)}?r=${code}`,
      imageUrl: `${origin}/og/quiz?r=${code}&locale=${locale}`,
    };
  };

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        {shared && (
          <div className="rounded-card border border-brand/30 bg-ink-800 p-6 sm:p-8">
            <p className="font-mono text-[11px] font-medium tracking-widest text-brand uppercase">
              {t("quiz.sharedTitle")}
            </p>
            <p className="mt-2 text-sm text-ink-300">{t("quiz.sharedBody")}</p>
            <div className="mt-4">
              <QuizResult locale={locale} scores={shared} compact />
            </div>
          </div>
        )}
        <div className="grid gap-8 rounded-card border border-ink-600 bg-ink-800 p-6 sm:p-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-10 md:p-10">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold tracking-tight text-ink-50 sm:text-3xl">
              {t("quiz.introTitle")}
            </h2>
            <p className="mt-3 text-pretty text-ink-300">
              {t("quiz.introBody")}
            </p>
            <p className="mt-4 rounded-field border border-brand/25 bg-brand/5 px-4 py-3 text-sm leading-relaxed text-ink-200">
              {t("quiz.honest")}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-auto md:pt-6">
              <Button variant="brand" size="lg" onClick={begin}>
                {last ? t("quiz.retake") : t("quiz.start")}
              </Button>
              {!signedIn && (
                <p className="text-xs text-ink-400">{t("quiz.keepHint")}</p>
              )}
            </div>
          </div>
          <ol className="grid content-center gap-2.5">
            {QUIZ_AREAS.map((a) => {
              const Icon = AREA_ICON[a];
              return (
                <li
                  key={a}
                  className="flex items-center gap-3 rounded-field border border-ink-600/70 bg-ink-900/40 px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink-50">
                      {labels[a]}
                    </span>
                    <span className="block text-xs text-ink-400">
                      {t("quiz.areaLevels", {
                        n: QUIZ_MAX_LEVEL * QUESTIONS_PER_CELL,
                      })}
                    </span>
                  </span>
                </li>
              );
            })}
            <li className="px-1 pt-1 font-mono text-[11px] tracking-wide text-ink-400 uppercase">
              {t("quiz.lengthNote", { n: QUIZ_LENGTH })}
            </li>
          </ol>
        </div>
        {last && (
          <div className="rounded-card border border-ink-600 bg-ink-800 p-6 sm:p-8">
            <p className="font-mono text-[11px] font-medium tracking-widest text-ink-400 uppercase">
              {t("quiz.lastResult")}
              {last.at && (
                <>
                  {" · "}
                  <time dateTime={last.at} suppressHydrationWarning>
                    {t("quiz.lastTaken", {
                      date: new Date(last.at).toLocaleDateString(
                        locale === "es" ? "es-MX" : "en-US",
                        { dateStyle: "medium" },
                      ),
                    })}
                  </time>
                </>
              )}
            </p>
            <div className="mt-4">
              <QuizResult
                locale={locale}
                scores={last.scores}
                misses={last.misses}
                compact
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === "result") {
    const scores = last?.scores ?? toQuizScores(state.cleared);
    return (
      <div className="mx-auto max-w-3xl rounded-card border border-ink-600 bg-ink-800 p-6 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-ink-50">
          {t("quiz.resultTitle")}
        </h2>
        <p className="mt-2 text-ink-300">{t("quiz.resultBody")}</p>
        <div className="mt-6">
          <QuizResult locale={locale} scores={scores} misses={state.misses}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant="brand" onClick={begin}>
                <RefreshIcon size={16} />
                {t("quiz.retake")}
              </Button>
              <ShareResultDialog
                analyticsId="quiz"
                fileName="metri-knowledge-map.png"
                triggerLabel={t("quiz.shareCta")}
                title={t("quiz.shareTitle")}
                description={t("quiz.shareDesc")}
                links={shareLinks(scores)}
                triggerClassName="h-11 px-4 text-sm"
              />
              <span className="ml-auto font-mono text-[11px] tracking-wide text-ink-400 uppercase">
                {saveState === "saved"
                  ? t("quiz.saved")
                  : saveState === "local"
                    ? t("quiz.keptLocally")
                    : saveState === "failed"
                      ? t("quiz.saveFailed")
                      : ""}
              </span>
            </div>
            {!signedIn && (
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-field border border-brand/30 bg-brand/10 p-4">
                <p className="min-w-0 flex-1 text-sm text-ink-100">
                  {t("quiz.signUpCta")}
                </p>
                <Link
                  href={routePath("signUp", locale)}
                  className={buttonVariants({ variant: "brand", size: "sm" })}
                >
                  {t("auth.signUp")}
                </Link>
                <Link
                  href={routePath("signIn", locale)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {t("quiz.signInCta")}
                </Link>
              </div>
            )}
          </QuizResult>
        </div>
      </div>
    );
  }

  if (!question || !area) return null;
  const level = toQuizLevel(state.current[area]);
  const order = optionOrderFor(state, question);
  const willFinish =
    revealed &&
    isQuizComplete(answerCurrent(state, picked === question.answer));
  const nextLabel = willFinish ? t("quiz.seeResult") : t("quiz.next");

  return (
    <div className="mx-auto max-w-3xl pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-0">
      <AreaLadder state={state} labels={labels} />
      {/* The verdict, spoken: one persistent polite region outside the
          animated card (a status mounted with its text is often missed). */}
      <p className="sr-only" role="status">
        {revealed
          ? `${picked === question.answer ? t("quiz.correct") : t("quiz.incorrect")} ${t(
              "quiz.answerWas",
              { answer: question.options[question.answer][locale] },
            )}`
          : ""}
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={`${area}-${state.current[area]}-${state.asked}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="mt-6 rounded-card border border-ink-600 bg-ink-800 p-5 sm:p-8"
        >
          <p className="font-mono text-[11px] font-medium tracking-widest text-ink-400 uppercase">
            {t("quiz.questionN", { n: state.asked + 1 })}
            {" · "}
            {t("quiz.progress", {
              area: labels[area],
              level: t(LEVEL_KEY[level]),
            })}
          </p>
          <h2
            ref={promptRef}
            data-asked={state.asked}
            tabIndex={-1}
            className="mt-3 text-xl font-bold tracking-tight text-balance text-ink-50 outline-none sm:text-2xl"
          >
            {question.prompt[locale]}
          </h2>

          <ul className="mt-6 grid gap-2">
            {order.map((i, slot) => {
              const option = question.options[i];
              const isAnswer = i === question.answer;
              const isPicked = i === picked;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => pick(i)}
                    aria-disabled={revealed}
                    aria-pressed={isPicked}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-field border px-4 py-3.5 text-left text-sm transition-colors aria-disabled:cursor-default max-sm:scroll-mb-36",
                      !revealed &&
                        "border-ink-600 bg-ink-900/60 text-ink-100 hover:border-brand/50 hover:bg-ink-750 active:bg-ink-700",
                      revealed &&
                        isAnswer &&
                        "border-brand bg-brand/15 text-ink-50",
                      revealed &&
                        isPicked &&
                        !isAnswer &&
                        "border-ink-400 text-ink-100",
                      revealed &&
                        !isAnswer &&
                        !isPicked &&
                        "border-ink-700 text-ink-400",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold",
                        revealed && isAnswer
                          ? "bg-brand text-brand-contrast"
                          : "bg-ink-700 text-ink-300",
                      )}
                    >
                      {revealed && isAnswer ? (
                        <CheckIcon size={14} />
                      ) : revealed && isPicked ? (
                        <XIcon size={14} />
                      ) : (
                        LETTERS[slot]
                      )}
                    </span>
                    <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                      {revealed && (isAnswer || isPicked) && (
                        <span className="sr-only">
                          {isAnswer
                            ? t("quiz.rightAnswer")
                            : t("quiz.yourAnswer")}
                          :{" "}
                        </span>
                      )}
                      {option[locale]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {!revealed && (
            <button
              type="button"
              onClick={() => pick(-1)}
              className="mt-3 text-sm font-medium text-ink-400 underline-offset-4 hover:text-ink-100 hover:underline max-sm:scroll-mb-36"
            >
              {t("quiz.dontKnow")}
            </button>
          )}

          <AnimatePresence>
            {revealed && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-5 rounded-field border border-ink-600/70 bg-ink-900/60 p-4">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      picked === question.answer
                        ? "text-brand"
                        : "text-ink-100",
                    )}
                  >
                    {picked === question.answer
                      ? t("quiz.correct")
                      : t("quiz.incorrect")}{" "}
                    <span className="font-normal text-ink-300">
                      {t("quiz.answerWas", {
                        answer: question.options[question.answer][locale],
                      })}
                    </span>
                  </p>
                  <p className="mt-2 font-mono text-[11px] tracking-widest text-ink-400 uppercase">
                    {t("quiz.why")}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-200">
                    {question.why[locale]}
                  </p>
                  <div className="mt-4 hidden sm:block">
                    <Button
                      size="sm"
                      variant="brand"
                      onClick={advance}
                      data-quiz-next
                    >
                      {nextLabel}
                    </Button>
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      </AnimatePresence>

      {/* Phone bar: attempt progress always, Next once an answer is
          revealed. Pinned so the thumb never has to travel. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-600 bg-ink-900/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mt-4 sm:rounded-card sm:border sm:bg-ink-800 sm:p-4 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex justify-between font-mono text-[10px] tracking-wide text-ink-400 uppercase">
              <span>{t("quiz.questionN", { n: state.asked + 1 })}</span>
              <span>{t("quiz.remaining", { n: remaining })}</span>
            </div>
            <div
              className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-700"
              role="progressbar"
              aria-label={t("quiz.questionN", { n: state.asked + 1 })}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={attemptPct}
            >
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-300"
                style={{ width: `${attemptPct}%` }}
              />
            </div>
          </div>
          {revealed && (
            <div className="sm:hidden">
              <Button
                size="sm"
                variant="brand"
                onClick={advance}
                data-quiz-next
              >
                {nextLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
