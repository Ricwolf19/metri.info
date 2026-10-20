import type { QuizMiss } from "@/lib/quiz/engine";
import {
  QUIZ_AREAS,
  QUIZ_MAX_LEVEL,
  type QuizArea,
  type QuizLevel,
  toQuizLevel,
} from "@/lib/quiz/areas";

/** The persisted result shape, identical to the app's MMKV value
 * (`{"nutrition":2,"training":4,"body":0,"fundamentals":1}`). */
export type QuizScores = Record<QuizArea, QuizLevel>;

/** Highest cleared level per area, every area present and clamped. */
export const toQuizScores = (
  partial: Partial<Record<QuizArea, number>>,
): QuizScores => {
  const out = {} as QuizScores;
  for (const area of QUIZ_AREAS) out[area] = toQuizLevel(partial[area] ?? 0);
  return out;
};

/** Strict parse: `null` unless all four areas are integers 0..4, so an old or
 * corrupt value counts as "never taken" instead of a broken radar. */
export const parseScores = (value: unknown): QuizScores | null => {
  if (typeof value !== "object" || value === null) return null;
  const rec = value as Record<string, unknown>;
  const out = {} as QuizScores;
  for (const area of QUIZ_AREAS) {
    const n = rec[area];
    if (
      typeof n !== "number" ||
      !Number.isInteger(n) ||
      n < 0 ||
      n > QUIZ_MAX_LEVEL
    )
      return null;
    out[area] = n as QuizLevel;
  }
  return out;
};

/** Browser-side memory of the last result: the web twin of the app's MMKV key.
 * Guarded reads/writes, because storage can be blocked or full. */
const LOCAL_SCORES_KEY = "metri_quiz_scores";

export type StoredResult = {
  scores: QuizScores;
  at: string;
  /** Missed cells, when the result carries them (new attempts do). */
  misses?: QuizMiss[];
};

const AREA_SET = new Set<string>(QUIZ_AREAS);

/** Misses are advisory: anything malformed is dropped, never rendered. At
 * most one per area (an area closes on its first miss), integers only. */
export const parseMisses = (value: unknown): QuizMiss[] => {
  if (!Array.isArray(value)) return [];
  const out: QuizMiss[] = [];
  const cells = new Set<string>();
  for (const m of value) {
    if (typeof m !== "object" || m === null) continue;
    const r = m as Record<string, unknown>;
    const key = `${String(r.area)}:${String(r.level)}`;
    if (
      typeof r.area !== "string" ||
      !AREA_SET.has(r.area) ||
      cells.has(key) ||
      !Number.isInteger(r.level) ||
      (r.level as number) < 1 ||
      (r.level as number) > QUIZ_MAX_LEVEL ||
      !Number.isInteger(r.variant) ||
      (r.variant as number) < 0
    )
      continue;
    cells.add(key);
    out.push({
      area: r.area as QuizArea,
      level: r.level as number,
      variant: r.variant as number,
    });
    if (out.length === QUIZ_AREAS.length * QUIZ_MAX_LEVEL) break;
  }
  return out;
};

/** A real run asks every cell once, and an area's level is the run of
 * correct answers from basic: exactly `first missed level - 1`, or the top
 * when nothing in the area was missed. */
export const isConsistentAttempt = (
  scores: QuizScores,
  misses: QuizMiss[],
  asked: number,
): boolean => {
  if (asked !== QUIZ_AREAS.length * QUIZ_MAX_LEVEL) return false;
  return QUIZ_AREAS.every((area) => {
    const levels = misses.filter((m) => m.area === area).map((m) => m.level);
    const first = levels.length ? Math.min(...levels) : QUIZ_MAX_LEVEL + 1;
    return scores[area] === first - 1;
  });
};

export const readLocalResult = (): StoredResult | null => {
  try {
    const raw = localStorage.getItem(LOCAL_SCORES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      scores?: unknown;
      at?: unknown;
      misses?: unknown;
    };
    const scores = parseScores(parsed.scores);
    if (!scores) return null;
    return {
      scores,
      at: typeof parsed.at === "string" ? parsed.at : "",
      misses: parseMisses(parsed.misses),
    };
  } catch {
    return null;
  }
};

export const writeLocalResult = (
  scores: QuizScores,
  misses: QuizMiss[] = [],
): void => {
  try {
    localStorage.setItem(
      LOCAL_SCORES_KEY,
      JSON.stringify({ scores, at: new Date().toISOString(), misses }),
    );
  } catch {}
};

/** `2.4.0.1` in `QUIZ_AREAS` order: the share-link form of a result. */
export const encodeScores = (scores: QuizScores): string =>
  QUIZ_AREAS.map((a) => scores[a]).join(".");

export const decodeScores = (
  raw: string | null | undefined,
): QuizScores | null => {
  if (!raw || !/^[0-4](\.[0-4]){3}$/.test(raw)) return null;
  const parts = raw.split(".").map(Number);
  return toQuizScores(
    Object.fromEntries(QUIZ_AREAS.map((a, i) => [a, parts[i]])) as Partial<
      Record<QuizArea, number>
    >,
  );
};
