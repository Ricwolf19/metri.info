import "server-only";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

/**
 * Gate a Server Component to admins. Reads the Better Auth session, then checks
 * the authoritative `role` from the DB (role is never a sign-up input, so it
 * can't be self-assigned). Redirects to sign-in when logged out, home when
 * logged in but not an admin. Returns the session user on success.
 */
export const requireAdmin = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const [row] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (row?.role !== "admin") redirect("/");
  return session.user;
};

/**
 * Gate a Server Component to any signed-in user. Reads the Better Auth session
 * and redirects to sign-in when logged out. Returns the session user on success.
 */
export const requireUser = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return session.user;
};
