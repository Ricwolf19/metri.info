import "server-only";

import { count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { calculationLog, favorite } from "@/lib/db/schema";

export type AccountStats = {
  saved: number;
  favorites: number;
};

/** Aggregate counts for the identity header / account tier. Returns zeros when
 * the DB is unreachable so the account page still renders. */
export const getAccountStats = async (
  userId: string,
): Promise<AccountStats> => {
  try {
    const [[savedRow], [favRow]] = await Promise.all([
      db
        .select({ value: count() })
        .from(calculationLog)
        .where(eq(calculationLog.userId, userId)),
      db
        .select({ value: count() })
        .from(favorite)
        .where(eq(favorite.userId, userId)),
    ]);
    return { saved: savedRow?.value ?? 0, favorites: favRow?.value ?? 0 };
  } catch {
    return { saved: 0, favorites: 0 };
  }
};
