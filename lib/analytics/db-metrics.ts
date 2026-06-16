import "server-only";

import { count, gte, sql } from "drizzle-orm";

import { CALC_CONTENT } from "@/lib/calculators/content";
import type { CalcId } from "@/lib/calculators/types";
import { db } from "@/lib/db";
import { calculationLog, favorite, session, user } from "@/lib/db/schema";

type Totals = {
  users: number;
  sessions: number;
  activeSessions: number;
  calculations: number;
  favorites: number;
};

type DayPoint = { date: string; value: number };

type TopCalculator = { id: string; name: string; value: number };

export type DbMetrics = {
  totals: Totals;
  calcsPerDay: DayPoint[];
  signupsPerDay: DayPoint[];
  topCalculators: TopCalculator[];
} | null;

const DAYS = 30;

/** Human-readable name for a logged `calculatorType`, falling back to the raw
 * id (covers types not in the bundled registry). */
const calcName = (id: string) => CALC_CONTENT[id as CalcId]?.en.h1 ?? id;

/** Fill a sparse per-day count series with zeroes for the last `DAYS` days so
 * charts render a continuous timeline. `rows` come back as { day, value }. */
const fillDays = (rows: { day: string; value: number }[]): DayPoint[] => {
  const map = new Map(rows.map((r) => [r.day, r.value]));
  const out: DayPoint[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, value: map.get(key) ?? 0 });
  }
  return out;
};

const since = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (DAYS - 1));
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/** First-party metrics aggregated in Postgres. Returns null when the DB is not
 * configured (no DATABASE_URL) or a query fails, so the page degrades to a
 * placeholder instead of crashing. */
export const getDbMetrics = async (): Promise<DbMetrics> => {
  try {
    const from = since();
    const now = new Date();

    const dayExpr = sql<string>`to_char(date_trunc('day', ${calculationLog.createdAt}), 'YYYY-MM-DD')`;
    const signupDayExpr = sql<string>`to_char(date_trunc('day', ${user.createdAt}), 'YYYY-MM-DD')`;

    const [
      usersRow,
      sessionsRow,
      activeRow,
      calcsRow,
      favoritesRow,
      perDay,
      signupsRaw,
      topRaw,
    ] = await Promise.all([
      db.select({ c: count() }).from(user),
      db.select({ c: count() }).from(session),
      db
        .select({ c: count() })
        .from(session)
        .where(gte(session.expiresAt, now)),
      db.select({ c: count() }).from(calculationLog),
      db.select({ c: count() }).from(favorite),
      db
        .select({ day: dayExpr, value: count() })
        .from(calculationLog)
        .where(gte(calculationLog.createdAt, from))
        .groupBy(dayExpr),
      db
        .select({ day: signupDayExpr, value: count() })
        .from(user)
        .where(gte(user.createdAt, from))
        .groupBy(signupDayExpr),
      db
        .select({ type: calculationLog.calculatorType, value: count() })
        .from(calculationLog)
        .groupBy(calculationLog.calculatorType)
        .orderBy(sql`count(*) desc`)
        .limit(10),
    ]);

    const totals: Totals = {
      users: usersRow[0]?.c ?? 0,
      sessions: sessionsRow[0]?.c ?? 0,
      activeSessions: activeRow[0]?.c ?? 0,
      calculations: calcsRow[0]?.c ?? 0,
      favorites: favoritesRow[0]?.c ?? 0,
    };

    return {
      totals,
      calcsPerDay: fillDays(perDay),
      signupsPerDay: fillDays(signupsRaw),
      topCalculators: topRaw.map((r) => ({
        id: r.type,
        name: calcName(r.type),
        value: r.value,
      })),
    };
  } catch {
    return null;
  }
};
