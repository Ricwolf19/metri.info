import type { DocCategory } from "@/lib/docs/categories";
import { QUIZ_MAX_LEVEL, type QuizArea } from "@/lib/quiz/areas";
import type { QuizScores } from "@/lib/quiz/scores";

/** Where to read next for each area: the knowledge-base section that covers
 * it. The quiz recommends, it never locks a guide (same rule as the app). */
export const AREA_DOCS: Record<QuizArea, DocCategory> = {
  nutrition: "nutrition",
  training: "training",
  body: "progress",
  fundamentals: "getting-started",
};

export type StudyHint = { area: QuizArea; cleared: number; gap: number };

/** Areas worth studying, weakest first; a fully cleared area is left out. */
export const studyPlan = (scores: QuizScores): StudyHint[] =>
  (Object.keys(AREA_DOCS) as QuizArea[])
    .map((area) => ({
      area,
      cleared: scores[area],
      gap: QUIZ_MAX_LEVEL - scores[area],
    }))
    .filter((h) => h.gap > 0)
    .sort((a, b) => b.gap - a.gap);
