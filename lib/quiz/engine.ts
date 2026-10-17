import { QUIZ_AREAS, QUIZ_MAX_LEVEL, type QuizArea } from "@/lib/quiz/areas";
import type { QuizQuestion } from "@/lib/quiz/content";

/**
 * Quiz state machine, pure and UI-free. Mirrors the mobile engine
 * (`src/features/quiz/engine.ts`): each area starts at level 1 (basic); a
 * correct answer clears the level and climbs, a wrong one closes the area.
 * Areas rotate round-robin until all four close. That branching is what makes
 * the per-area radar honest: nobody answers pro questions outside their depth.
 *
 * The one addition over mobile is `variant`: the web bank holds more than one
 * question per (area, level), and an attempt fixes which one each cell shows
 * at start, so a retake asks different questions and a mid-attempt re-render
 * never swaps the prompt under the reader. With one question per cell the
 * variant is always 0, which is exactly the mobile behaviour.
 */
export type QuizState = {
  /** Areas still in play, in rotation order. */
  order: QuizArea[];
  /** Index into `order`. */
  cursor: number;
  /** Level being attempted per area (1..4). */
  current: Record<QuizArea, number>;
  /** Highest cleared level per area (0 = not even basic). */
  cleared: Record<QuizArea, number>;
  /** Chosen question per cell, keyed `area:level`. */
  variant: Record<string, number>;
  /** Questions answered so far. */
  asked: number;
  /** Cells answered wrong (or skipped), in order: what to review afterwards. */
  misses: QuizMiss[];
};

/** A missed cell; `variant` identifies the exact question within the cell. */
export type QuizMiss = { area: QuizArea; level: number; variant: number };

const zero = (): Record<QuizArea, number> => ({
  nutrition: 0,
  training: 0,
  body: 0,
  fundamentals: 0,
});

const cellKey = (area: QuizArea, level: number) => `${area}:${level}`;

const pool = (
  questions: readonly QuizQuestion[],
  area: QuizArea,
  level: number,
) => questions.filter((q) => q.area === area && q.level === level);

/** A fresh attempt. `random` is injectable so tests stay deterministic. */
export const startQuiz = (
  questions: readonly QuizQuestion[],
  random: () => number = Math.random,
): QuizState => {
  const variant: Record<string, number> = {};
  for (const area of QUIZ_AREAS) {
    for (let level = 1; level <= QUIZ_MAX_LEVEL; level++) {
      const n = pool(questions, area, level).length;
      variant[cellKey(area, level)] = n > 1 ? Math.floor(random() * n) % n : 0;
    }
  }
  return {
    order: [...QUIZ_AREAS],
    cursor: 0,
    current: { nutrition: 1, training: 1, body: 1, fundamentals: 1 },
    cleared: zero(),
    variant,
    asked: 0,
    misses: [],
  };
};

export const isQuizComplete = (state: QuizState): boolean =>
  state.order.length === 0;

export const currentArea = (state: QuizState): QuizArea | null =>
  state.order[state.cursor] ?? null;

export const currentQuestion = (
  state: QuizState,
  questions: readonly QuizQuestion[],
): QuizQuestion | null => {
  const area = currentArea(state);
  if (!area) return null;
  const level = state.current[area];
  const candidates = pool(questions, area, level);
  if (candidates.length === 0) return null;
  const pick = state.variant[cellKey(area, level)] ?? 0;
  return candidates[pick % candidates.length] ?? null;
};

export const answerCurrent = (
  state: QuizState,
  correct: boolean,
): QuizState => {
  const area = currentArea(state);
  if (!area) return state;
  const next: QuizState = {
    ...state,
    current: { ...state.current },
    cleared: { ...state.cleared },
    asked: state.asked + 1,
    misses: state.misses,
  };
  if (correct) {
    next.cleared[area] = next.current[area];
    next.current[area] += 1;
    if (next.current[area] > QUIZ_MAX_LEVEL)
      next.order = next.order.filter((a) => a !== area);
  } else {
    next.misses = [
      ...state.misses,
      {
        area,
        level: state.current[area],
        variant: state.variant[cellKey(area, state.current[area])] ?? 0,
      },
    ];
    next.order = next.order.filter((a) => a !== area);
  }
  // Round-robin: a closed area drops out and the next one slides into its
  // index; an area still open hands the turn to the one after it.
  const stillOpen = next.order.includes(area);
  const len = next.order.length;
  next.cursor = len ? (stillOpen ? state.cursor + 1 : state.cursor) % len : 0;
  return next;
};

/** Upper bound on questions still to come: every open area could clear
 * every remaining level. Drives the "up to N more" progress bar. */
export const maxRemaining = (state: QuizState): number =>
  state.order.reduce(
    (sum, area) => sum + (QUIZ_MAX_LEVEL - state.current[area] + 1),
    0,
  );

/** The question a miss refers to, or null if the bank changed under it. */
export const missedQuestion = (
  miss: QuizMiss,
  questions: readonly QuizQuestion[],
): QuizQuestion | null => {
  const candidates = pool(questions, miss.area, miss.level);
  return candidates[miss.variant % Math.max(1, candidates.length)] ?? null;
};

export type AreaScore = { area: QuizArea; cleared: number };

export const quizScores = (state: QuizState): AreaScore[] =>
  QUIZ_AREAS.map((area) => ({ area, cleared: state.cleared[area] }));
