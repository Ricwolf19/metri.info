import "server-only";

import { eq } from "drizzle-orm";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export type AdminActor =
  | { ok: true; adminId: string }
  | { ok: false; reason: "unauthenticated" | "forbidden" };

/**
 * Who is calling, re-checked against the DB (never the session token). Mirrors
 * `requireAdmin`, but returns a Result instead of redirecting, for server
 * actions and list fetchers that run behind client controls.
 */
export const requireAdminActor = async (): Promise<AdminActor> => {
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
