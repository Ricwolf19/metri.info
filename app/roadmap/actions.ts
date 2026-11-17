"use server";

import { getSession } from "@/lib/auth/session";
import type { CalcFacts } from "@/lib/calculators/prefill";
import { readCalcFacts } from "@/lib/calculators/read-facts";
import { event } from "@/lib/log/logger";
import { parseRoadmap, type RoadmapState } from "@/lib/roadmap/state";
import type { Evidence } from "@/lib/roadmap/steps";
import { readEvidence, readRoadmap, writeRoadmap } from "@/lib/roadmap/store";

export type RoadmapLoad =
  | { signedIn: false }
  | {
      signedIn: true;
      roadmap: RoadmapState | null;
      /** The stored plan couldn't be read: never treat that as "none", or
       * the next save would overwrite it. */
      readFailed: boolean;
      evidence: Evidence;
      /** Seeds the diagnostic (sex, body fat, weight) when starting over. */
      facts: CalcFacts | null;
    };

/**
 * Everything the roadmap page needs for a signed-in account, in one call:
 * the stored roadmap, what the account already shows for each step, and the
 * facts that prefill the diagnostic. Called from the client so the page
 * itself stays static, like the calculators.
 */
export const loadRoadmap = async (): Promise<RoadmapLoad> => {
  const session = await getSession();
  if (!session) return { signedIn: false };
  const userId = session.user.id;
  const [read, evidence, facts] = await Promise.all([
    readRoadmap(userId).then(
      (roadmap) => ({ roadmap, readFailed: false }),
      (error) => {
        event.warn("roadmap.read-failed", { userId, error });
        return { roadmap: null, readFailed: true };
      },
    ),
    readEvidence(userId, new Date()),
    readCalcFacts(userId).catch(() => null),
  ]);
  return { signedIn: true, ...read, evidence, facts };
};

export type SaveRoadmapResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "invalid" | "failed" };

/** Store the whole roadmap for the signed-in account. The state is parsed
 * again here: the client is only a browser. */
export const saveRoadmap = async (
  input: unknown,
): Promise<SaveRoadmapResult> => {
  const session = await getSession();
  if (!session) return { ok: false, reason: "unauthenticated" };
  const state = parseRoadmap(input);
  if (!state) return { ok: false, reason: "invalid" };
  try {
    await writeRoadmap(session.user.id, state);
    return { ok: true };
  } catch (error) {
    event.warn("roadmap.save-failed", {
      userId: session.user.id,
      error: String(error),
    });
    return { ok: false, reason: "failed" };
  }
};
