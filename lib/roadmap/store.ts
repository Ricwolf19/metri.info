import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { roadmap } from "@/lib/db/schema";

import { parseRoadmap, type RoadmapState } from "./state";

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
