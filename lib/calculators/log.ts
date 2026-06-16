"use server";

import { updateTag } from "next/cache";

import { DB_METRICS_TAG } from "@/lib/analytics/tags";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { calculationLog } from "@/lib/db/schema";

type SaveArgs = {
  calculatorType: string;
  inputs: unknown;
  results: unknown;
};

type SaveResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "error" };

/**
 * Explicitly persist a calculation to the signed-in user's history. Requires a
 * session — anonymous saves are rejected (`reason: "unauthenticated"`) so the DB
 * never gets a null-userId row. Best-effort beyond that: never throws to the
 * client and no-ops gracefully when DATABASE_URL is unset.
 */
export const saveCalculation = async ({
  calculatorType,
  inputs,
  results,
}: SaveArgs): Promise<SaveResult> => {
  if (!process.env.DATABASE_URL) return { ok: false, reason: "error" };
  try {
    const session = await getSession();
    if (!session) return { ok: false, reason: "unauthenticated" };
    await db.insert(calculationLog).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      calculatorType,
      inputs,
      results,
    });
    updateTag(DB_METRICS_TAG);
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
};
