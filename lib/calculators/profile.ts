"use server";

import { getUserProfile } from "@/lib/account/settings";
import { getSession } from "@/lib/auth/session";
import type { CalcProfile } from "@/lib/calculators/prefill";

/**
 * Client-callable: the signed-in user's profile values used to seed calculator
 * inputs. Returns null for guests (or when no profile row exists). Fetched
 * client-side on purpose — the calculator pages are statically generated, and
 * reading per-user data on the server would make them dynamic and slow.
 */
export const getCalcProfile = async (): Promise<CalcProfile | null> => {
  const session = await getSession();
  if (!session) return null;
  const p = await getUserProfile(session.user.id);
  if (!p) return null;
  return {
    sex: p.sex,
    bodyWeightKg: p.bodyWeightKg,
    bodyHeightCm: p.bodyHeightCm,
    activityLevel: p.activityLevel,
    unitsPreference: p.unitsPreference,
  };
};
