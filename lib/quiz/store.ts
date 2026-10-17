import "server-only";

import { randomUUID } from "crypto";

import { and, desc, eq, notInArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { quizAttempt } from "@/lib/db/schema";
import type { QuizMiss } from "@/lib/quiz/engine";
import { parseMisses, parseScores, type QuizScores } from "@/lib/quiz/scores";

/** Attempts kept per account. */
const KEEP = 50;

export type QuizAttemptRow = {
  id: string;
  scores: QuizScores;
  misses: QuizMiss[];
  asked: number;
  createdAt: Date;
};

/** Persist one finished attempt for an account (Premium: the web's twin of the
 * app's local result, kept as history). */
export const saveAttempt = async (
  userId: string,
  scores: QuizScores,
  asked: number,
  misses: QuizMiss[],
): Promise<QuizAttemptRow> => {
  const id = randomUUID();
  const [row] = await db
    .insert(quizAttempt)
    .values({ id, userId, scores, asked, misses })
    .returning({ createdAt: quizAttempt.createdAt });
  // Keep the newest KEEP attempts per account; the rest is unbounded storage
  // a script could fill. Best effort: a failed prune never fails the save.
  try {
    const keep = db
      .select({ id: quizAttempt.id })
      .from(quizAttempt)
      .where(eq(quizAttempt.userId, userId))
      .orderBy(desc(quizAttempt.createdAt))
      .limit(KEEP);
    await db
      .delete(quizAttempt)
      .where(
        and(eq(quizAttempt.userId, userId), notInArray(quizAttempt.id, keep)),
      );
  } catch {
    // pruning is housekeeping
  }
  return {
    id,
    scores,
    misses,
    asked,
    createdAt: row?.createdAt ?? new Date(),
  };
};

/** Newest first; rows whose scores don't parse are skipped, never rendered. */
export const listAttempts = async (
  userId: string,
  limit = 8,
): Promise<QuizAttemptRow[]> => {
  try {
    const rows = await db
      .select({
        id: quizAttempt.id,
        scores: quizAttempt.scores,
        misses: quizAttempt.misses,
        asked: quizAttempt.asked,
        createdAt: quizAttempt.createdAt,
      })
      .from(quizAttempt)
      .where(eq(quizAttempt.userId, userId))
      .orderBy(desc(quizAttempt.createdAt))
      .limit(limit);
    return rows.flatMap((r) => {
      const scores = parseScores(r.scores);
      return scores
        ? [
            {
              id: r.id,
              scores,
              misses: parseMisses(r.misses),
              asked: r.asked,
              createdAt: r.createdAt,
            },
          ]
        : [];
    });
  } catch {
    return [];
  }
};
