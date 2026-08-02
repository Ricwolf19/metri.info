import "server-only";

import { eq } from "drizzle-orm";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { can } from "@/lib/entitlements";

export type SyncAccess =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Collapses a sync cycle (~21 requests in seconds) into one plan SELECT while
 * keeping the revocation window far below the 5-minute cookie staleness the
 * DB re-read exists to avoid. Per warm instance: a cold start just misses and
 * re-reads — correctness never depends on a hit. `null` plans are cached too
 * (free users retrying against 403s).
 */
const PLAN_TTL_MS = 30_000;
const PLAN_CACHE_MAX = 1000;
const planCache = new Map<string, { plan: string | null; at: number }>();

/** `undefined` = no such user (vs `null` = user with no plan). */
const readPlan = async (userId: string): Promise<string | null | undefined> => {
  const hit = planCache.get(userId);
  if (hit && Date.now() - hit.at < PLAN_TTL_MS) return hit.plan;

  const [row] = await db
    .select({ plan: user.plan })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!row) return undefined;

  if (planCache.size >= PLAN_CACHE_MAX) planCache.clear();
  planCache.set(userId, { plan: row.plan, at: Date.now() });
  return row.plan;
};

/** Drop a user's cached plan — call from wherever `user.plan` is mutated so an
 * upgrade syncs immediately and a revocation cuts access on the next request
 * (same-instance; other warm instances age out within `PLAN_TTL_MS`). */
export const invalidatePlanCache = (userId: string): void => {
  planCache.delete(userId);
};

/**
 * Gate for both sync endpoints: a live session whose account currently holds
 * the `sync` entitlement.
 *
 * `plan` is deliberately re-read from the database instead of trusted from
 * `session.user.plan`: that field rides on Better Auth's signed cookie cache
 * (5 min), so it can't be forged — but it can be *stale*, letting a revoked
 * subscription keep syncing until the cookie refreshes.
 */
export const requireSyncAccess = async (): Promise<SyncAccess> => {
  const session = await getSession();
  if (!session?.user) return { ok: false, status: 401, error: "unauthorized" };

  const plan = await readPlan(session.user.id);
  if (plan === undefined) {
    return { ok: false, status: 401, error: "unauthorized" };
  }
  if (!can(plan, "sync")) {
    return { ok: false, status: 403, error: "premium_required" };
  }
  return { ok: true, userId: session.user.id };
};
