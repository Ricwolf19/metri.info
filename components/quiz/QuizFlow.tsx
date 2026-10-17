"use client";

import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";

import {
  AppleIcon,
  BookIcon,
  CheckIcon,
  DumbbellIcon,
  type IconProps,
  PauseIcon,
  PlayIcon,
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
  REVEAL_MS,
  toQuizLevel,
} from "@/lib/quiz/areas";
import { QUIZ_QUESTIONS } from "@/lib/quiz/content";
import {
  answerCurrent,
  currentArea,
  currentQuestion,
  isQuizComplete,
  maxRemaining,
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

/** Four tiny ladders, one per area, filled to the cleared level; the area
 * being asked glows. Reads as "where am I" without promising a total. */
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
        const closed = !state.order.includes(area);
        return (
          <li key={area}>
            <div className="grid grid-cols-4 gap-0.5">
              {Array.from({ length: QUIZ_MAX_LEVEL }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-colors",
                    i < state.cleared[area]
                      ? "bg-brand"
                      : area === active && i === state.current[area] - 1
                        ? "bg-brand/40"
                        : "bg-ink-700",
                  )}
                />
              ))}
            </div>
            <p
              className={cn(
                "mt-1.5 flex items-center gap-1 truncate font-mono text-[10px] tracking-wide uppercase",
                area === active
                  ? "text-brand"
                  : closed
                    ? "text-ink-600"
                    : "text-ink-500",
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
 * explanation after every answer and a countdown to the next one, then the
 * map. Anyone can take it; the result always stays in this browser, a
 * signed-in account also keeps it as history. On phones the progress and the
 * countdown controls live in a bar pinned to the bottom. Must sit inside a
 * `MotionProvider`.
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
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

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
    setProgress(0);
    setPaused(false);
    setState(next);
    if (isQuizComplete(next)) void finish(next);
  };

  // Auto-advance after REVEAL_MS unless paused with the button. Hover must
  // not hold it: the pointer is always inside the card right after a click,
  // so a hover-hold never let the countdown start on desktop.
  useEffect(() => {
    if (!revealed || paused || phase !== "question") return;
    const startedAt = performance.now();
    const base = progress;
    const tick = () => {
      const p = Math.min(1, base + (performance.now() - startedAt) / REVEAL_MS);
      setProgress(p);
      if (p >= 1) advance();
      else timerRef.current = window.setTimeout(tick, 100);
    };
    timerRef.current = window.setTimeout(tick, 100);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // `progress` is the resume point and `advance` closes over fresh state;
    // re-running on them is the intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, paused, phase]);

  // Move focus to the new prompt so a screen reader announces it and the next
  // Tab lands on its options, not back at the top of the page.
  useEffect(() => {
    if (phase === "question")
      headingRef.current?.focus({ preventScroll: true });
  }, [phase, state.asked]);

  const begin = () => {
    setState(startQuiz(QUIZ_QUESTIONS));
    setPicked(null);
    setProgress(0);
    setPaused(false);
    setSaveState(null);
    setPhase("question");
    track("quiz_started");
  };

  const pick = (index: number) => {
    if (revealed) return;
    setPicked(index);
    setProgress(0);
  };

  const shareLinks = (scores: QuizScores) => () => {
    const { origin } = window.location;
    const code = encodeScores(scores);
    return {
      url: `${origin}${routePath("quiz", locale)}?r=${code}`,
      imageUrl: `${origin}/og/quiz?r=${code}&locale=${locale}`,
    };
  };

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
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
        <div className="rounded-card border border-ink-600 bg-ink-800 p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-ink-50">
            {t("quiz.introTitle")}
          </h2>
          <p className="mt-3 text-pretty text-ink-300">{t("quiz.introBody")}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant="brand" size="lg" onClick={begin}>
              {last ? t("quiz.retake") : t("quiz.start")}
            </Button>
            {!signedIn && (
              <p className="text-xs text-ink-400">{t("quiz.keepHint")}</p>
            )}
          </div>
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
  const willFinish =
    revealed &&
    isQuizComplete(answerCurrent(state, picked === question.answer));
  const nextLabel = willFinish ? t("quiz.seeResult") : t("quiz.next");

  return (
    <div className="mx-auto max-w-3xl pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-0">
      <AreaLadder state={state} labels={labels} />
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={`${area}-${state.current[area]}`}
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
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 text-xl font-bold tracking-tight text-balance text-ink-50 outline-none sm:text-2xl"
          >
            {question.prompt[locale]}
          </h2>

          <ul className="mt-6 grid gap-2">
            {question.options.map((option, i) => {
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
                      "flex w-full items-center gap-3 rounded-field border px-4 py-3.5 text-left text-sm transition-colors aria-disabled:cursor-default",
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
                        "border-ink-700 text-ink-400 opacity-60",
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
                        LETTERS[i]
                      )}
                    </span>
                    {option[locale]}
                  </button>
                </li>
              );
            })}
          </ul>

          {!revealed && (
            <button
              type="button"
              onClick={() => pick(-1)}
              className="mt-3 text-sm font-medium text-ink-400 underline-offset-4 hover:text-ink-100 hover:underline"
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
                role="status"
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
                  <div className="mt-4 hidden items-center gap-3 sm:flex">
                    <Button size="sm" variant="brand" onClick={advance}>
                      {nextLabel}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setPaused((p) => !p)}
                      aria-label={t("quiz.pause")}
                      title={paused ? t("quiz.resume") : t("quiz.pause")}
                      aria-pressed={paused}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-field border border-ink-600 text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-50"
                    >
                      {paused ? (
                        <PlayIcon size={15} />
                      ) : (
                        <PauseIcon size={15} />
                      )}
                    </button>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block h-1 overflow-hidden rounded-full bg-ink-700"
                        aria-hidden
                      >
                        <span
                          className="block h-full rounded-full bg-brand/70 transition-[width] duration-100 ease-linear"
                          style={{ width: `${progress * 100}%` }}
                        />
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-ink-500">
                        {t("quiz.autoNext")}
                      </span>
                    </span>
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      </AnimatePresence>

      {/* Phone bar: attempt progress always, the countdown controls once an
          answer is revealed. Pinned so the thumb never has to travel. */}
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
            {revealed && (
              <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-ink-700 sm:hidden">
                <div
                  className="h-full bg-brand/70 transition-[width] duration-100 ease-linear"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </div>
          {revealed && (
            <div className="flex items-center gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={t("quiz.pause")}
                title={paused ? t("quiz.resume") : t("quiz.pause")}
                aria-pressed={paused}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-field border border-ink-600 bg-ink-800 text-ink-200"
              >
                {paused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
              </button>
              <Button size="sm" variant="brand" onClick={advance}>
                {nextLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
