import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { QuizScores } from "@/lib/quiz/scores";

import { NEXT_STEP_GUIDE, previousPeriod } from "./monthly";
import { buildTipsEdition, pickTips, type TipsSignals } from "./tips";

const guideExists = (slug: string) =>
  ["en", "es"].every((locale) =>
    existsSync(join(process.cwd(), "content/docs", locale, `${slug}.mdx`)),
  );

const signals: TipsSignals = {
  reason: "no_data",
  calculations: 0,
  topCalculator: null,
  quizScores: null,
  latestVersion: "1.17.0",
};

const scores = (over: Partial<QuizScores>): QuizScores => ({
  nutrition: 4,
  training: 4,
  body: 4,
  fundamentals: 4,
  ...over,
});

describe("pickTips", () => {
  it("never repeats a tip in consecutive months", () => {
    let period = "2026-10";
    for (let i = 0; i < 24; i++) {
      const before = previousPeriod(period);
      const current = pickTips(period).map((t) => t.guide);
      const last = pickTips(before).map((t) => t.guide);
      expect(current).toHaveLength(3);
      expect(new Set(current).size).toBe(3);
      expect(current.filter((g) => last.includes(g))).toEqual([]);
      period = before;
    }
  });

  it("is stable for a month, so a retried run sends the same tips", () => {
    expect(pickTips("2026-10")).toEqual(pickTips("2026-10"));
  });
});

describe("guides the emails link to", () => {
  it("exist in both languages", () => {
    const slugs = new Set<string>(Object.values(NEXT_STEP_GUIDE));
    let period = "2026-10";
    for (let i = 0; i < 12; i++) {
      for (const tip of pickTips(period)) slugs.add(tip.guide);
      period = previousPeriod(period);
    }
    for (const area of ["nutrition", "training", "body", "fundamentals"]) {
      const edition = buildTipsEdition(period, {
        ...signals,
        quizScores: scores({ [area]: 0 }),
      });
      if (edition.knowledge?.kind === "study")
        slugs.add(edition.knowledge.guide);
    }
    expect([...slugs].filter((slug) => !guideExists(slug))).toEqual([]);
  });
});

describe("buildTipsEdition", () => {
  it("recommends the knowledge check to someone who hasn't taken it", () => {
    expect(buildTipsEdition("2026-10", signals).knowledge).toEqual({
      kind: "take",
    });
  });

  it("points at the weakest area once it has been taken", () => {
    const edition = buildTipsEdition("2026-10", {
      ...signals,
      quizScores: scores({ nutrition: 3, body: 1 }),
    });
    expect(edition.knowledge).toEqual({
      kind: "study",
      area: "body",
      guide: "measuring-progress",
    });
  });

  it("has nothing to push on a perfect result", () => {
    expect(
      buildTipsEdition("2026-10", { ...signals, quizScores: scores({}) })
        .knowledge,
    ).toBeNull();
  });

  it("suggests the natural next calculator", () => {
    const edition = buildTipsEdition("2026-10", {
      ...signals,
      calculations: 3,
      topCalculator: "tdee",
    });
    expect(edition.topCalculator).toBe("tdee");
    expect(edition.calculator).toBe("macros");
  });

  it("falls back on a calculator it doesn't recognize", () => {
    const edition = buildTipsEdition("2026-10", {
      ...signals,
      topCalculator: "retired-tool",
    });
    expect(edition.topCalculator).toBeNull();
    expect(edition.calculator).toBe("tdee");
  });
});
