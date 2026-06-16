import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { account, userProfile } from "@/lib/db/schema";

export type AccountProfile = {
  displayName: string | null;
  bio: string | null;
  unitsPreference: string;
  bodyWeightKg: number | null;
  bodyHeightCm: number | null;
  sex: string | null;
  activityLevel: string | null;
};

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
        sex: userProfile.sex,
        activityLevel: userProfile.activityLevel,
      })
      .from(userProfile)
      .where(eq(userProfile.id, userId))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
};
