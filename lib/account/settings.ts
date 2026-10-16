import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { account, user, userProfile } from "@/lib/db/schema";

/** The profile fields the web edits. Mirrors what the mobile app writes
 * through `PUT /api/profile`, so both sides see the same account. */
export type AccountProfile = {
  displayName: string | null;
  bio: string | null;
  unitsPreference: string;
  bodyWeightKg: number | null;
  bodyHeightCm: number | null;
  bodyFatPct: number | null;
  age: number | null;
  sex: string | null;
  activityLevel: string | null;
  bmrFormula: string | null;
  clockFormat: string | null;
  locale: string | null;
  latestBmr: number | null;
  latestTdee: number | null;
};

export type AccountNotificationPrefs = { releaseEmails: boolean };

/** Connected providers for a user, by `providerId` (e.g. `credential`,
 * `google`, `github`). Drives password-presence detection and the linked-
 * accounts UI. Returns `[]` when the DB is unreachable. */
export const getUserProviderIds = async (userId: string): Promise<string[]> => {
  try {
    const rows = await db
      .select({ providerId: account.providerId })
      .from(account)
      .where(eq(account.userId, userId));
    return rows.map((r) => r.providerId);
  } catch {
    return [];
  }
};

/** Read the extended profile row (may not exist — no row is auto-created). */
export const getUserProfile = async (
  userId: string,
): Promise<AccountProfile | null> => {
  try {
    const [row] = await db
      .select({
        displayName: userProfile.displayName,
        bio: userProfile.bio,
        unitsPreference: userProfile.unitsPreference,
        bodyWeightKg: userProfile.bodyWeightKg,
        bodyHeightCm: userProfile.bodyHeightCm,
        bodyFatPct: userProfile.bodyFatPct,
        age: userProfile.age,
        sex: userProfile.sex,
        activityLevel: userProfile.activityLevel,
        bmrFormula: userProfile.bmrFormula,
        clockFormat: userProfile.clockFormat,
        locale: userProfile.locale,
        latestBmr: userProfile.latestBmr,
        latestTdee: userProfile.latestTdee,
      })
      .from(userProfile)
      .where(eq(userProfile.id, userId))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
};

/** Account-level notification flags (today: release emails only — push and
 * reminder preferences live on the device and never reach the server). */
export const getUserNotificationPrefs = async (
  userId: string,
): Promise<AccountNotificationPrefs> => {
  try {
    const [row] = await db
      .select({ releaseEmails: user.releaseEmails })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    return { releaseEmails: row?.releaseEmails ?? true };
  } catch {
    return { releaseEmails: true };
  }
};
