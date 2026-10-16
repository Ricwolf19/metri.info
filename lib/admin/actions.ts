"use server";

import { randomUUID } from "crypto";

import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

import { getSession } from "@/lib/auth/session";
import { tags } from "@/lib/cache/tags";
import { db } from "@/lib/db";
import { subscription, user } from "@/lib/db/schema";
import { event } from "@/lib/log/logger";
import { invalidatePlanCache } from "@/lib/sync/guard";

/** Every way an admin action can refuse; `failed` is the catch-all for a
 * database error, so callers always get a Result and never an exception. */
export type AdminFailReason =
  | "unauthenticated"
  | "forbidden"
  | "self"
  | "not_found"
  | "admin_protected"
  | "email_mismatch"
  | "failed";

export type AdminActionResult =
  | { ok: true }
  | { ok: false; reason: AdminFailReason };

type Actor =
  | { ok: true; adminId: string }
  | { ok: false; reason: AdminFailReason };

/**
 * Who is calling, re-checked against the DB (never the session token) —
 * mirrors `requireAdmin`, but returns a Result instead of redirecting since
 * these run behind client controls.
 */
const requireAdminActor = async (): Promise<Actor> => {
  const session = await getSession();
  if (!session) return { ok: false, reason: "unauthenticated" };

  const [me] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);
  if (me?.role !== "admin") return { ok: false, reason: "forbidden" };
  return { ok: true, adminId: session.user.id };
};

/**
 * Admin-only: grant or revoke premium for a user. Writes the billing
 * source-of-truth (`subscription`, provider "manual") and denormalizes the
 * result onto `user.plan` so it rides on the session.
 */
export const setUserPremium = async (
  userId: string,
  premium: boolean,
): Promise<AdminActionResult> => {
  const actor = await requireAdminActor();
  if (!actor.ok) return actor;

  const plan = premium ? "premium" : "free";
  const status = premium ? "active" : "canceled";
  const now = new Date();

  // One non-interactive transaction: the billing row and the denormalized
  // `user.plan` cache can never disagree because one of the two writes failed.
  try {
    await db.batch([
      db
        .insert(subscription)
        .values({
          id: randomUUID(),
          userId,
          plan,
          status,
          provider: "manual",
          grantedBy: actor.adminId,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: subscription.userId,
          set: {
            plan,
            status,
            provider: "manual",
            grantedBy: actor.adminId,
            updatedAt: now,
          },
        }),
      db.update(user).set({ plan, updatedAt: now }).where(eq(user.id, userId)),
    ]);
  } catch (error) {
    event.warn("admin.set-premium-failed", { userId, error: String(error) });
    return { ok: false, reason: "failed" };
  }

  // Same-instance only, but it makes a grant/revoke bite on the next sync
  // request instead of waiting out the guard's 30s TTL.
  invalidatePlanCache(userId);

  revalidatePath("/admin/users");
  return { ok: true };
};

/**
 * Admin-only hard delete. The typed email is the confirmation: it must match
 * the target's exactly (case-insensitive). Admins can't delete themselves or
 * other admins from here. One `DELETE` on `user` — every child table
 * (session, account, subscription, user_profile, calculation_log, favorite,
 * sync_row) cascades via its FK, so no transaction is needed (neon-http
 * throws on `db.transaction()` anyway).
 *
 * Reasons: see `AdminFailReason`.
 */
export const deleteUser = async (
  userId: string,
  confirmEmail: string,
): Promise<AdminActionResult> => {
  const actor = await requireAdminActor();
  if (!actor.ok) return actor;
  if (userId === actor.adminId) return { ok: false, reason: "self" };

  const [target] = await db
    .select({ email: user.email, role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!target) return { ok: false, reason: "not_found" };
  if (target.role === "admin") return { ok: false, reason: "admin_protected" };
  if (confirmEmail.trim().toLowerCase() !== target.email.toLowerCase()) {
    return { ok: false, reason: "email_mismatch" };
  }

  try {
    await db.delete(user).where(eq(user.id, userId));
  } catch (error) {
    event.warn("admin.user-delete-failed", { userId, error: String(error) });
    return { ok: false, reason: "failed" };
  }

  invalidatePlanCache(userId);
  updateTag(tags.metrics.db);
  updateTag(tags.favorites(userId));
  revalidatePath("/admin/users");
  event.info("admin.user-deleted", { userId, by: actor.adminId });
  return { ok: true };
};
