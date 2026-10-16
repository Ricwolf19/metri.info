import "server-only";

import { count, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { calculationLog, user } from "@/lib/db/schema";

const LIMIT = 100;
const QUERY_MAX = 100;

/** Literal LIKE pattern: `%` and `_` in user input must not act as wildcards. */
const likeLiteral = (q: string) => q.replace(/[\\%_]/g, (c) => `\\${c}`);

/** Newest users (capped at 100) plus the total count, for the Users table.
 * `query` filters by email or name (case-insensitive substring); the total is
 * then the filtered count. Returns null when the DB is unconfigured or a
 * query fails. */
export const getAdminUsers = async (query?: string) => {
  const q = (query ?? "").trim().slice(0, QUERY_MAX);
  const where = q
    ? or(
        ilike(user.email, `%${likeLiteral(q)}%`),
        ilike(user.name, `%${likeLiteral(q)}%`),
      )
    : undefined;
  try {
    const [rows, totalRow] = await Promise.all([
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(where)
        .orderBy(desc(user.createdAt))
        .limit(LIMIT),
      db.select({ c: count() }).from(user).where(where),
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
