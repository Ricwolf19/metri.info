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
  it("covers every (area, level) cell at least once, with four options and both languages", () => {
    for (const area of QUIZ_AREAS) {
      for (let level = 1; level <= QUIZ_MAX_LEVEL; level++) {
        const cell = QUIZ_QUESTIONS.filter(
          (q) => q.area === area && q.level === level,
        );
        expect(cell.length, `${area} L${level}`).toBeGreaterThan(0);
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
});

describe("quiz engine", () => {
  it("scores the run from basic and keeps asking an area after a miss", () => {
    let s = startQuiz(QUIZ_QUESTIONS, () => 0);
    const [first, second] = s.queue.map((c) => c.area);
    // Round 1: the second area misses its basic question.
    s = answerCurrent(s, true);
    s = answerCurrent(s, false);
    s = answerCurrent(s, true);
    s = answerCurrent(s, true);
    expect(s.cleared[second]).toBe(0);
    expect(s.cleared[first]).toBe(1);
    expect(s.asked).toBe(4);
    expect(s.current[second]).toBe(2);
    expect(s.misses).toEqual([{ area: second, level: 1, variant: 0 }]);
  });

  it("completes after exactly 16 answers and reports 0..4 per area", () => {
    let s = startQuiz(QUIZ_QUESTIONS, () => 0.99);
    let n = 0;
    while (!isQuizComplete(s) && n < 50) {
      expect(currentQuestion(s, QUIZ_QUESTIONS)).not.toBeNull();
      s = answerCurrent(s, true);
      n++;
    }
    expect(n).toBe(16);
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
