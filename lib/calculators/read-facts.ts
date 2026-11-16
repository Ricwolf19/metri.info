import "server-only";

import { desc, eq } from "drizzle-orm";

import { getUserProfile } from "@/lib/account/settings";
import { buildCalcFacts, type SavedCalc } from "@/lib/calculators/facts";
import type { CalcFacts } from "@/lib/calculators/prefill";
import { db } from "@/lib/db";
import { calculationLog } from "@/lib/db/schema";
import { getLatestBodyLogs } from "@/lib/sync/latest";

/** Enough recent saves to find the last of each calculator. */
const SAVED_LIMIT = 50;

const recentSaves = async (userId: string): Promise<SavedCalc[]> => {
  try {
    return await db
      .select({
        calculatorType: calculationLog.calculatorType,
        inputs: calculationLog.inputs,
        createdAt: calculationLog.createdAt,
      })
      .from(calculationLog)
      .where(eq(calculationLog.userId, userId))
      .orderBy(desc(calculationLog.createdAt))
      .limit(SAVED_LIMIT);
  } catch {
    return [];
  }
};

/** What we know about an account: its profile, the latest readings its
 * phone synced and its saved calculations (`buildCalcFacts` sets the
 * precedence). Server-only: callers pass the session's user id. */
export const readCalcFacts = async (userId: string): Promise<CalcFacts> => {
  const [profile, logs, saved] = await Promise.all([
    getUserProfile(userId),
    getLatestBodyLogs(userId),
    recentSaves(userId),
  ]);
  return buildCalcFacts({ profile, logs, saved, now: new Date() });
};
