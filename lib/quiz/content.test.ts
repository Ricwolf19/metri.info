import { describe, expect, it } from "vitest";

import { QUIZ_AREAS, QUIZ_MAX_LEVEL } from "@/lib/quiz/areas";
import { QUIZ_QUESTIONS } from "@/lib/quiz/content";
import {
  answerCurrent,
  currentQuestion,
  isQuizComplete,
  quizScores,
  startQuiz,
} from "@/lib/quiz/engine";
import { parseScores, toQuizScores } from "@/lib/quiz/scores";

describe("quiz bank", () => {
  it("holds enough questions per (area, level) cell, with four options and both languages", () => {
    for (const area of QUIZ_AREAS) {
      for (let level = 1; level <= QUIZ_MAX_LEVEL; level++) {
        const cell = QUIZ_QUESTIONS.filter(
          (q) => q.area === area && q.level === level,
        );
        // Two are asked per attempt; a third means a retake can differ.
        expect(cell.length, `${area} L${level}`).toBeGreaterThanOrEqual(3);
      }
    }
    const seen = new Set<string>();
    for (const q of QUIZ_QUESTIONS) {
      const key = q.prompt.en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      expect(seen.has(key), `duplicate prompt: ${q.prompt.en}`).toBe(false);
      seen.add(key);
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      expect(q.why.en.length).toBeGreaterThan(0);
      expect(q.why.es.length).toBeGreaterThan(0);
      expect(q.prompt.en.length).toBeGreaterThan(0);
      expect(q.prompt.es.length).toBeGreaterThan(0);
    }
  });

  it("does not let the longest option give the answer away", () => {
    // "Pick the longest" is the first guessing strategy anyone tries. Across
    // the bank the right answer must be the longest option no more often
    // than chance, and never by a wide margin.
    let longest = 0;
    for (const q of QUIZ_QUESTIONS) {
      const lens = q.options.map((o) => o.en.length);
      const max = Math.max(...lens);
      const answerLen = lens[q.answer];
      if (answerLen === max && lens.filter((l) => l === max).length === 1)
        longest++;
      const runnerUp = Math.max(...lens.filter((_, i) => i !== q.answer));
      expect(
        answerLen - runnerUp,
        `${q.prompt.en}: answer is far longer than every distractor`,
      ).toBeLessThanOrEqual(12);
    }
    expect(longest / QUIZ_QUESTIONS.length).toBeLessThanOrEqual(0.3);
  });
});

describe("quiz engine", () => {
  it("scores the run from basic and keeps asking an area after a miss", () => {
    let s = startQuiz(QUIZ_QUESTIONS, () => 0);
    const [first, second] = s.queue.map((c) => c.area);
    // Level 1, first pass: the second area misses its basic question.
    s = answerCurrent(s, true);
    s = answerCurrent(s, false);
    s = answerCurrent(s, true);
    s = answerCurrent(s, true);
    expect(s.cleared[second]).toBe(0);
    expect(s.cleared[first]).toBe(0); // one of two basic questions so far
    expect(s.current[second]).toBe(1); // its second basic question is still due
    // Second pass of level 1: everyone right.
    for (let i = 0; i < 4; i++) s = answerCurrent(s, true);
    expect(s.asked).toBe(8);
    expect(s.cleared[first]).toBe(1);
    expect(s.cleared[second]).toBe(0);
    expect(s.current[second]).toBe(2);
    expect(s.misses).toEqual([
      { area: second, level: 1, variant: expect.any(Number) },
    ]);
  });

  it("completes after exactly 32 answers and reports 0..4 per area", () => {
    let s = startQuiz(QUIZ_QUESTIONS, () => 0.99);
    let n = 0;
    while (!isQuizComplete(s) && n < 100) {
      expect(currentQuestion(s, QUIZ_QUESTIONS)).not.toBeNull();
      s = answerCurrent(s, true);
      n++;
    }
    expect(n).toBe(32);
    for (const { cleared } of quizScores(s)) expect(cleared).toBe(4);
  });

  it("keeps the chosen variant stable within an attempt", () => {
    const s = startQuiz(QUIZ_QUESTIONS, () => 0.7);
    const a = currentQuestion(s, QUIZ_QUESTIONS);
    const b = currentQuestion(s, QUIZ_QUESTIONS);
    expect(a).toBe(b);
  });
});

describe("quiz scores", () => {
  it("parses only complete, in-range maps", () => {
    expect(
      parseScores({ nutrition: 2, training: 4, body: 0, fundamentals: 1 }),
    ).toEqual({ nutrition: 2, training: 4, body: 0, fundamentals: 1 });
    expect(parseScores({ nutrition: 2 })).toBeNull();
    expect(
      parseScores({ nutrition: 5, training: 0, body: 0, fundamentals: 0 }),
    ).toBeNull();
    expect(toQuizScores({ body: 9 })).toEqual({
      nutrition: 0,
      training: 0,
      body: 4,
      fundamentals: 0,
    });
  });
});
