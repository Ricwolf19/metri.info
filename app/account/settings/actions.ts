"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import {
  normalizeProfileFields,
  profileRangeError,
} from "@/lib/account/profile-input";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { user, userProfile } from "@/lib/db/schema";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { event } from "@/lib/log/logger";
import { type Result, safeAsync } from "@/lib/result";

const requireSessionUser = async () => {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session.user;
};

const revalidateAccount = () => {
  // Bust the Router Cache for the whole account area (settings + activity +
  // header user menu) so freshly-saved data never renders stale.
  revalidatePath("/account", "layout");
  revalidatePath("/es/cuenta", "layout");
};

export type ProfileInput = {
  name: string;
  displayName?: string | null;
  bio?: string | null;
  unitsPreference: string;
  sex?: string | null;
  age?: number | string | null;
  activityLevel?: string | null;
  bodyWeightKg?: number | string | null;
  bodyHeightCm?: number | string | null;
  bodyFatPct?: number | string | null;
  bmrFormula?: string | null;
  clockFormat?: string | null;
  locale?: string | null;
};

/**
 * Save the profile: UPSERT the `user_profile` row (no row is auto-created) and
 * update the Better Auth display `name`. Units default to `kg` when unknown.
 * `latestBmr`/`latestTdee` are left alone — only the app's calculators write
 * those, from a computed result.
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
    // The form surfaces an out-of-range number instead of dropping it.
    const outOfRange = profileRangeError(input);
    if (outOfRange) throw new ValidationError({ [outOfRange]: "range" });

    const bio = typeof input.bio === "string" ? input.bio.trim() : "";
    const now = new Date();
    const values = {
      ...normalizeProfileFields(input),
      bio: bio.length > 0 && bio.length <= 280 ? bio : null,
      updatedAt: now,
    };

    await db.batch([
      db
        .insert(userProfile)
        .values({ id: sessionUser.id, ...values })
        .onConflictDoUpdate({ target: userProfile.id, set: values }),
      db
        .update(user)
        .set({ name, updatedAt: now })
        .where(eq(user.id, sessionUser.id)),
    ]);

    revalidateAccount();
    return { saved: true as const };
  });

/**
 * Release-email opt-in/out from the account page. The same flag the app's
 * profile switch writes through `/api/profile` and the email's unsubscribe
 * link clears — so turning it back on here re-subscribes.
 */
export const setReleaseEmails = async (
  enabled: boolean,
): Promise<Result<{ releaseEmails: boolean }>> =>
  safeAsync(async () => {
    const sessionUser = await requireSessionUser();
    await db
      .update(user)
      .set({ releaseEmails: enabled, updatedAt: new Date() })
      .where(eq(user.id, sessionUser.id));
    event.info(enabled ? "release.resubscribed" : "release.unsubscribed", {
      userId: sessionUser.id,
      via: "account",
    });
    revalidateAccount();
    return { releaseEmails: enabled };
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
      revalidateAccount();
      return { method: "set" as const };
    }

    await auth.api.requestPasswordReset({
      body: { email: sessionUser.email, redirectTo: "/reset-password" },
      headers: reqHeaders,
    });
    return { method: "email" as const };
  });
