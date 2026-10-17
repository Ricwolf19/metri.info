"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/entitlements";
import { event } from "@/lib/log/logger";
import {
  isConsistentAttempt,
  parseMisses,
  parseScores,
} from "@/lib/quiz/scores";
import { saveAttempt } from "@/lib/quiz/store";

export type SaveQuizResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "upgrade" | "invalid" | "failed" };

/**
 * Save a finished attempt to the account's history. Anyone can take the quiz;
 * any signed-in account keeps the result (the entitlement is `history`, see
 * `lib/entitlements.ts`). The scores are re-validated here: the client is
 * only a browser.
 */
export const saveQuizAttempt = async (input: {
  scores: unknown;
  asked: number;
  misses?: unknown;
}): Promise<SaveQuizResult> => {
  const session = await getSession();
  if (!session) return { ok: false, reason: "unauthenticated" };
  const plan = (session.user as { plan?: string | null }).plan;
  if (!can(plan, "history")) return { ok: false, reason: "upgrade" };
  const scores = parseScores(input.scores);
  const asked = Number.isInteger(input.asked) ? input.asked : 0;
  const misses = parseMisses(input.misses);
  // The three numbers must describe one real run of the engine.
  if (!scores || !isConsistentAttempt(scores, misses, asked))
    return { ok: false, reason: "invalid" };
  try {
    await saveAttempt(session.user.id, scores, asked, misses);
  } catch (error) {
    event.warn("quiz.save-failed", {
      userId: session.user.id,
      error: String(error),
    });
    return { ok: false, reason: "failed" };
  }
  revalidatePath("/account/activity");
  revalidatePath("/es/cuenta/actividad");
  event.info("quiz.saved", { userId: session.user.id, asked });
  return { ok: true };
};
