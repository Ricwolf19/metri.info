import { describe, expect, it } from "vitest";

import { QUIZ_AREAS, QUIZ_MAX_LEVEL } from "./areas";
import { QUIZ_QUESTIONS } from "./content";
import {
  answerCurrent,
  cellKey,
  currentArea,
  currentQuestion,
  isQuizComplete,
  levelOutcome,
  maxRemaining,
  optionOrderFor,
  QUESTIONS_PER_CELL,
  QUIZ_LENGTH,
  startQuiz,
} from "./engine";
import { isConsistentAttempt, type QuizScores, toQuizScores } from "./scores";

const seeded = (seed: number) => () => {
  // xorshift32: deterministic, decent spread, no deps.
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) % 10_000) / 10_000;
};

describe("quiz engine (full diagnostic)", () => {
  it("asks every cell twice, level by level, with the areas rotated", () => {
    const s = startQuiz(QUIZ_QUESTIONS, seeded(7));
    expect(s.queue).toHaveLength(QUIZ_LENGTH);
    const perLevel = QUIZ_AREAS.length * QUESTIONS_PER_CELL;
    for (let level = 1; level <= QUIZ_MAX_LEVEL; level++) {
      const block = s.queue.slice((level - 1) * perLevel, level * perLevel);
      expect(block.every((c) => c.level === level)).toBe(true);
      for (let slot = 0; slot < QUESTIONS_PER_CELL; slot++) {
        const pass = block.filter((c) => c.slot === slot);
        expect(new Set(pass.map((c) => c.area)).size).toBe(QUIZ_AREAS.length);
      }
    }
    expect(maxRemaining(s)).toBe(QUIZ_LENGTH);
  });

  it("never asks the same question twice in one attempt", () => {
    for (const seed of [1, 2, 3, 5, 8, 13]) {
      const s = startQuiz(QUIZ_QUESTIONS, seeded(seed));
      for (const area of QUIZ_AREAS)
        for (let level = 1; level <= QUIZ_MAX_LEVEL; level++) {
          const picks = new Set(
            Array.from(
              { length: QUESTIONS_PER_CELL },
              (_, slot) => s.variant[cellKey(area, level, slot)],
            ),
          );
          expect(picks.size, `${area} L${level} seed ${seed}`).toBe(
            QUESTIONS_PER_CELL,
          );
        }
    }
  });

  it("keeps asking an area after a miss and scores the run from basic", () => {
    let s = startQuiz(QUIZ_QUESTIONS, seeded(3));
    // One wrong answer in level 2 of some area: the other question of that
    // level is still asked, and the level does not count.
    const failAt = { area: s.queue[9].area, level: 2 };
    let missed = false;
    while (!isQuizComplete(s)) {
      const area = currentArea(s)!;
      const level = s.current[area];
      const wrong = !missed && area === failAt.area && level === failAt.level;
      if (wrong) missed = true;
      if (area === failAt.area && level === failAt.level && !wrong)
        expect(levelOutcome(s, area, level)).toBe(false);
      s = answerCurrent(s, !wrong);
    }
    expect(s.asked).toBe(QUIZ_LENGTH);
    expect(s.cleared[failAt.area]).toBe(1);
    expect(levelOutcome(s, failAt.area, 1)).toBe(true);
    expect(levelOutcome(s, failAt.area, 2)).toBe(false);
    expect(s.misses).toEqual([
      { area: failAt.area, level: 2, variant: expect.any(Number) },
    ]);
    for (const area of QUIZ_AREAS)
      if (area !== failAt.area) expect(s.cleared[area]).toBe(QUIZ_MAX_LEVEL);
    expect(
      isConsistentAttempt(toQuizScores(s.cleared), s.misses, s.asked),
    ).toBe(true);
  });

  it("shuffles the options but keeps the answer index intact", () => {
    const s = startQuiz(QUIZ_QUESTIONS, seeded(11));
    const q = currentQuestion(s, QUIZ_QUESTIONS)!;
    const order = optionOrderFor(s, q);
    expect([...order].sort()).toEqual([0, 1, 2, 3]);
    expect(q.options[q.answer]).toBe(q.options[order[order.indexOf(q.answer)]]);
  });

  it("rejects a map that does not match its misses", () => {
    const scores: QuizScores = {
      nutrition: 4,
      training: 2,
      body: 0,
      fundamentals: 4,
    };
    const misses = [
      { area: "training" as const, level: 3, variant: 0 },
      { area: "training" as const, level: 3, variant: 2 },
      { area: "body" as const, level: 1, variant: 0 },
    ];
    expect(isConsistentAttempt(scores, misses, QUIZ_LENGTH)).toBe(true);
    expect(
      isConsistentAttempt({ ...scores, training: 3 }, misses, QUIZ_LENGTH),
    ).toBe(false);
    expect(isConsistentAttempt(scores, misses, 4)).toBe(false);
  });
});
