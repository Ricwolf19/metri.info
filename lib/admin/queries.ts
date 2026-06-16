import "server-only";

import { count, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { calculationLog, user } from "@/lib/db/schema";

const LIMIT = 100;

/** Newest users (capped at 100) plus the total count, for the Users table.
 * Returns null when the DB is unconfigured or a query fails. */
export const getAdminUsers = async () => {
  try {
    const [rows, totalRow] = await Promise.all([
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        })
        .from(user)
        .orderBy(desc(user.createdAt))
        .limit(LIMIT),
      db.select({ c: count() }).from(user),
    ]);
    return { rows, total: totalRow[0]?.c ?? 0 };
  } catch {
    return null;
  }
};

/** Newest saved calculations (capped at 100) joined to the owning user's email,
 * plus the total count. A single left join — no N+1. Returns null on failure. */
export const getAdminCalculations = async () => {
  try {
    const [rows, totalRow] = await Promise.all([
      db
        .select({
          id: calculationLog.id,
          calculatorType: calculationLog.calculatorType,
          results: calculationLog.results,
          email: user.email,
          createdAt: calculationLog.createdAt,
        })
        .from(calculationLog)
        .leftJoin(user, eq(calculationLog.userId, user.id))
        .orderBy(desc(calculationLog.createdAt))
        .limit(LIMIT),
      db.select({ c: count() }).from(calculationLog),
    ]);
    return { rows, total: totalRow[0]?.c ?? 0 };
  } catch {
    return null;
  }
};
