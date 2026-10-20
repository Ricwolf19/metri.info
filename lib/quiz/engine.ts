import { QUIZ_AREAS, QUIZ_MAX_LEVEL, type QuizArea } from "@/lib/quiz/areas";
import type { QuizQuestion } from "@/lib/quiz/content";

/**
 * Quiz state machine, pure and UI-free.
 *
 * The web runs the check as a full diagnostic: every (area, level) cell is
 * asked, sixteen questions in all, grouped by level and with the areas in a
 * different order each round, so nobody can tell which area is being probed
 * or stop early. The score keeps the mobile app's meaning (`cleared` = the
 * run of levels answered right in a row from basic), so a map from either
 * app reads the same; the web just also records every miss above the run,
 * which is what the review list and the study advice are built from.
 *
 * Per attempt the engine fixes two things so a re-render never swaps the
 * prompt under the reader: `variant` (which question of the cell's pool is
 * asked; the bank holds several per cell) and `optionOrder` (the shuffled
 * order of the four answers, so the right one has no fixed position).
 */
export type QuizCell = { area: QuizArea; level: number };

export type QuizState = {
  /** Every cell of the attempt, in the order asked. */
  queue: QuizCell[];
  /** Index into `queue`. */
  cursor: number;
  /** Level being (or next to be) asked per area; `QUIZ_MAX_LEVEL + 1` when done. */
  current: Record<QuizArea, number>;
  /** Levels answered right in a row from basic (0 = not even basic). */
  cleared: Record<QuizArea, number>;
  /** Outcome per answered cell, keyed `area:level`. */
  answered: Record<string, boolean>;
  /** Chosen question per cell, keyed `area:level`. */
  variant: Record<string, number>;
  /** Display order of the options per cell, keyed `area:level`. */
  optionOrder: Record<string, number[]>;
  /** Questions answered so far. */
  asked: number;
  /** Cells answered wrong (or skipped), in order: what to review afterwards. */
  misses: QuizMiss[];
};

/** A missed cell; `variant` identifies the exact question within the cell. */
export type QuizMiss = { area: QuizArea; level: number; variant: number };

/** Questions in one attempt. */
export const QUIZ_LENGTH = QUIZ_AREAS.length * QUIZ_MAX_LEVEL;

const zero = (): Record<QuizArea, number> => ({
  nutrition: 0,
  training: 0,
  body: 0,
  fundamentals: 0,
});

export const cellKey = (area: QuizArea, level: number) => `${area}:${level}`;

const pool = (
  questions: readonly QuizQuestion[],
  area: QuizArea,
  level: number,
) => questions.filter((q) => q.area === area && q.level === level);

const shuffled = <T>(items: readonly T[], random: () => number): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/** A fresh attempt. `random` is injectable so tests stay deterministic. */
export const startQuiz = (
  questions: readonly QuizQuestion[],
  random: () => number = Math.random,
): QuizState => {
  const queue: QuizCell[] = [];
  const variant: Record<string, number> = {};
  const optionOrder: Record<string, number[]> = {};
  for (let level = 1; level <= QUIZ_MAX_LEVEL; level++) {
    for (const area of shuffled(QUIZ_AREAS, random)) {
      queue.push({ area, level });
      const candidates = pool(questions, area, level);
      const n = candidates.length;
      const pick = n > 1 ? Math.floor(random() * n) % n : 0;
      variant[cellKey(area, level)] = pick;
      const options = candidates[pick]?.options.length ?? 4;
      optionOrder[cellKey(area, level)] = shuffled(
        Array.from({ length: options }, (_, i) => i),
        random,
      );
    }
  }
  return {
    queue,
    cursor: 0,
    current: { nutrition: 1, training: 1, body: 1, fundamentals: 1 },
    cleared: zero(),
    answered: {},
    variant,
    optionOrder,
    asked: 0,
    misses: [],
  };
};

export const isQuizComplete = (state: QuizState): boolean =>
  state.cursor >= state.queue.length;

const currentCell = (state: QuizState): QuizCell | null =>
  state.queue[state.cursor] ?? null;

export const currentArea = (state: QuizState): QuizArea | null =>
  currentCell(state)?.area ?? null;

export const currentQuestion = (
  state: QuizState,
  questions: readonly QuizQuestion[],
): QuizQuestion | null => {
  const cell = currentCell(state);
  if (!cell) return null;
  const candidates = pool(questions, cell.area, cell.level);
  if (candidates.length === 0) return null;
  const pick = state.variant[cellKey(cell.area, cell.level)] ?? 0;
  return candidates[pick % candidates.length] ?? null;
};

/** The order the current question's options are shown in (indices into
 * `question.options`); identity when the attempt predates the shuffle. */
export const optionOrderFor = (
  state: QuizState,
  question: QuizQuestion,
): number[] => {
  const cell = currentCell(state);
  const order = cell ? state.optionOrder[cellKey(cell.area, cell.level)] : null;
  return order && order.length === question.options.length
    ? order
    : question.options.map((_, i) => i);
};

/** True once every level of the area has been answered. */
export const areaDone = (state: QuizState, area: QuizArea): boolean =>
  state.current[area] > QUIZ_MAX_LEVEL;

export const answerCurrent = (
  state: QuizState,
  correct: boolean,
): QuizState => {
  const cell = currentCell(state);
  if (!cell) return state;
  const { area, level } = cell;
  const answered = { ...state.answered, [cellKey(area, level)]: correct };
  let run = 0;
  while (run < QUIZ_MAX_LEVEL && answered[cellKey(area, run + 1)] === true)
    run++;
  let nextLevel = 1;
  while (nextLevel <= QUIZ_MAX_LEVEL && cellKey(area, nextLevel) in answered)
    nextLevel++;
  return {
    ...state,
    cursor: state.cursor + 1,
    current: { ...state.current, [area]: nextLevel },
    cleared: { ...state.cleared, [area]: run },
    answered,
    asked: state.asked + 1,
    misses: correct
      ? state.misses
      : [
          ...state.misses,
          { area, level, variant: state.variant[cellKey(area, level)] ?? 0 },
        ],
  };
};

/** Questions still to come. Drives the progress bar. */
export const maxRemaining = (state: QuizState): number =>
  Math.max(0, state.queue.length - state.cursor);

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
