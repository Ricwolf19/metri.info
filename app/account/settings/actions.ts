"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { user, userProfile } from "@/lib/db/schema";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { type Result, safeAsync } from "@/lib/result";

const requireSessionUser = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new UnauthorizedError();
  return session.user;
};

const toNumberOrNull = (raw: unknown): number | null => {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const optionalString = (raw: unknown): string | null => {
  const s = typeof raw === "string" ? raw.trim() : "";
  return s.length > 0 ? s : null;
};

export type ProfileInput = {
  name: string;
  displayName?: string | null;
  bio?: string | null;
  unitsPreference: string;
  sex?: string | null;
  activityLevel?: string | null;
  bodyWeightKg?: number | string | null;
  bodyHeightCm?: number | string | null;
};

/**
 * Save the profile: UPSERT the `user_profile` row (no row is auto-created) and
 * update the Better Auth display `name`. Units default to `kg` when unknown.
 */
export const saveProfile = async (
  input: ProfileInput,
): Promise<Result<{ saved: true }>> =>
  safeAsync(async () => {
    const sessionUser = await requireSessionUser();

    const name = input.name.trim();
    if (name.length < 1 || name.length > 100) {
      throw new ValidationError({ name: "required" });
    }
    const units = input.unitsPreference === "lb" ? "lb" : "kg";

    const values = {
      displayName: optionalString(input.displayName),
      bio: optionalString(input.bio),
      unitsPreference: units,
      sex: optionalString(input.sex),
      activityLevel: optionalString(input.activityLevel),
      bodyWeightKg: toNumberOrNull(input.bodyWeightKg),
      bodyHeightCm: toNumberOrNull(input.bodyHeightCm),
      updatedAt: new Date(),
    };

    await db
      .insert(userProfile)
      .values({ id: sessionUser.id, ...values })
      .onConflictDoUpdate({ target: userProfile.id, set: values });

    await db
      .update(user)
      .set({ name, updatedAt: new Date() })
      .where(eq(user.id, sessionUser.id));

    return { saved: true as const };
  });

/**
 * Set a password for an OAuth-only account via `auth.api.setPassword`
 * (verified to exist in better-auth 1.6.18 — `dist/api/routes/update-user.mjs`,
 * a `serverOnly` endpoint). If the installed version ever lacks it, we fall back
 * to the reset-password email flow and signal the caller to tell the user.
 */
export const setAccountPassword = async (
  newPassword: string,
): Promise<Result<{ method: "set" | "email" }>> =>
  safeAsync(async () => {
    const sessionUser = await requireSessionUser();
    if (newPassword.length < 8) {
      throw new ValidationError({ newPassword: "short" });
    }

    const reqHeaders = await headers();
    const setPassword = (
      auth.api as { setPassword?: (args: unknown) => Promise<unknown> }
    ).setPassword;

    if (typeof setPassword === "function") {
      await setPassword({ body: { newPassword }, headers: reqHeaders });
      return { method: "set" as const };
    }

    await auth.api.requestPasswordReset({
      body: { email: sessionUser.email, redirectTo: "/reset-password" },
      headers: reqHeaders,
    });
    return { method: "email" as const };
  });
