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
 * Gate for both sync endpoints: a live session whose account currently holds
 * the `sync` entitlement.
 *
 * `plan` is deliberately re-read from the database instead of trusted from
 * `session.user.plan`. That field rides on Better Auth's signed cookie cache
 * (5 min), so it can't be forged — but it can be *stale*, which meant a
 * subscription revoked by an admin kept syncing for up to five minutes. One
 * indexed primary-key lookup closes that window, mirroring what `requireAdmin`
 * already does for `role`.
 */
export const requireSyncAccess = async (): Promise<SyncAccess> => {
  const session = await getSession();
  if (!session?.user) return { ok: false, status: 401, error: "unauthorized" };

  const [row] = await db
    .select({ plan: user.plan })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!row) return { ok: false, status: 401, error: "unauthorized" };
  if (!can(row.plan, "sync")) {
    return { ok: false, status: 403, error: "premium_required" };
  }
  return { ok: true, userId: session.user.id };
};
