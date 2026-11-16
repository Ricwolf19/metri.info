import "server-only";

import { and, desc, eq, gte, isNotNull, max, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  calculationLog,
  quizAttempt,
  roadmap,
  syncRow,
  userProfile,
} from "@/lib/db/schema";
import { event } from "@/lib/log/logger";

import { parseRoadmap, type RoadmapState } from "./state";
import type { Evidence } from "./steps";

/** The account's roadmap, or null (none yet, or a row that doesn't parse). */
export const readRoadmap = async (
  userId: string,
): Promise<RoadmapState | null> => {
  const [row] = await db
    .select({
      answers: roadmap.answers,
      startedAt: roadmap.startedAt,
      done: roadmap.done,
      history: roadmap.history,
    })
    .from(roadmap)
    .where(eq(roadmap.userId, userId))
    .limit(1);
  return row
    ? parseRoadmap({ ...row, startedAt: row.startedAt.toISOString() })
    : null;
};

/** Upsert the whole state; it was parsed by the caller. */
export const writeRoadmap = async (
  userId: string,
  state: RoadmapState,
): Promise<void> => {
  const values = {
    answers: state.answers,
    startedAt: new Date(state.startedAt),
    done: state.done,
    history: state.history,
    updatedAt: new Date(),
  };
  await db
    .insert(roadmap)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: roadmap.userId, set: values });
};

const DAY_MS = 86_400_000;
/** Weigh-ins in the last two weeks that make "weigh daily" real. */
const WEIGH_IN_WINDOW_DAYS = 14;
const WEIGH_INS_NEEDED = 5;

/** A synced `YYYY-MM-DD` as the end of that day, so it compares with the
 * plan's ISO start the way a person reads it. */
const endOfDay = (date: string | null | undefined) =>
  date ? `${date}T23:59:59.000Z` : undefined;

const latest = (...dates: (string | undefined)[]) =>
  dates
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

/**
 * What the account already shows for each step: the last time each relevant
 * calculator was saved, the last knowledge check, the app's own TDEE, and the
 * synced weigh-ins and tape. Best effort: a failed read is "nothing seen".
 */
export const readEvidence = async (
  userId: string,
  now: Date,
): Promise<Evidence> => {
  try {
    const since = new Date(now.getTime() - WEIGH_IN_WINDOW_DAYS * DAY_MS)
      .toISOString()
      .slice(0, 10);
    const date = sql<string>`${syncRow.data}->>'date'`;
    const [saves, [quiz], [profile], weighIns, [tape]] = await Promise.all([
      db
        .select({
          type: calculationLog.calculatorType,
          at: max(calculationLog.createdAt),
        })
        .from(calculationLog)
        .where(eq(calculationLog.userId, userId))
        .groupBy(calculationLog.calculatorType),
      db
        .select({ at: max(quizAttempt.createdAt) })
        .from(quizAttempt)
        .where(eq(quizAttempt.userId, userId)),
      db
        .select({ at: userProfile.updatedAt })
        .from(userProfile)
        .where(
          and(eq(userProfile.id, userId), isNotNull(userProfile.latestTdee)),
        ),
      db
        .select({ date })
        .from(syncRow)
        .where(
          and(
            eq(syncRow.userId, userId),
            eq(syncRow.tableName, "body_metrics"),
            eq(syncRow.deleted, false),
            gte(date, since),
            // A body-fat-only reading is a row too, but not a weigh-in.
            isNotNull(sql`${syncRow.data}->>'weight_kg'`),
          ),
        )
        .orderBy(desc(date)),
      db
        .select({ date })
        .from(syncRow)
        .where(
          and(
            eq(syncRow.userId, userId),
            eq(syncRow.tableName, "body_measurements"),
            eq(syncRow.deleted, false),
          ),
        )
        .orderBy(desc(date))
        .limit(1),
    ]);
    const saved = (...types: string[]) =>
      latest(
        ...saves
          .filter((s) => types.includes(s.type))
          .map((s) => s.at?.toISOString()),
      );
    const tapeAt = endOfDay(tape?.date);
    const lastWeighIn =
      weighIns.length >= WEIGH_INS_NEEDED
        ? endOfDay(weighIns[0].date)
        : undefined;
    const evidence: Evidence = {
      baseline: latest(saved("bodyfat", "whtr"), tapeAt),
      maintenance: latest(saved("tdee"), profile?.at.toISOString()),
      knowledge: quiz?.at?.toISOString(),
      calories: saved("deficit", "macros"),
      protein: saved("protein", "macros"),
      weighIns: lastWeighIn,
      checkins: latest(tapeAt, saved("bodyfat")),
    };
    return Object.fromEntries(
      Object.entries(evidence).filter(([, v]) => v !== undefined),
    );
  } catch (error) {
    event.warn("roadmap.evidence-failed", { userId, error: String(error) });
    return {};
  }
};
