"use server";

import { randomUUID } from "crypto";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { subscription, user } from "@/lib/db/schema";
import { invalidatePlanCache } from "@/lib/sync/guard";

export type AdminActionResult = { ok: true } | { ok: false; reason: string };

/**
 * Admin-only: grant or revoke premium for a user. Writes the billing
 * source-of-truth (`subscription`, provider "manual") and denormalizes the
 * result onto `user.plan` so it rides on the session. Re-checks the admin role
 * from the DB (never trusts the session token) — mirrors `requireAdmin`, but
 * returns a Result instead of redirecting since it's invoked from a client
 * toggle.
 */
export const setUserPremium = async (
  userId: string,
  premium: boolean,
): Promise<AdminActionResult> => {
  const session = await getSession();
  if (!session) return { ok: false, reason: "unauthenticated" };

  const [me] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);
  if (me?.role !== "admin") return { ok: false, reason: "forbidden" };

  const plan = premium ? "premium" : "free";
  const status = premium ? "active" : "canceled";
  const now = new Date();

  await db
    .insert(subscription)
    .values({
      id: randomUUID(),
      userId,
      plan,
      status,
      provider: "manual",
      grantedBy: session.user.id,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: subscription.userId,
      set: {
        plan,
        status,
        provider: "manual",
        grantedBy: session.user.id,
        updatedAt: now,
      },
    });

  await db
    .update(user)
    .set({ plan, updatedAt: now })
    .where(eq(user.id, userId));

  // Same-instance only, but it makes a grant/revoke bite on the next sync
  // request instead of waiting out the guard's 30s TTL.
  invalidatePlanCache(userId);

  revalidatePath("/admin/users");
  return { ok: true };
};
