import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";

/**
 * Account profile for the mobile app — what makes a reinstall feel like the
 * same account (body metrics, preferences) instead of a first launch.
 * Session-gated only: this is account data, not premium training sync.
 *
 *   GET → the caller's profile row (or null when never written)
 *   PUT → full replace of the whitelisted fields: omitted or invalid fields
 *         are stored as null (units falls back to "kg"), unknown fields are
 *         ignored. The client always sends the complete profile.
 */

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
const str = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 && v.length <= 64 ? v : null;

export const GET = async () => {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [row] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.id, session.user.id))
    .limit(1);

  return NextResponse.json({ profile: row ?? null });
};

export const PUT = async (req: Request) => {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const raw: unknown = await req.json().catch(() => null);
  // Scalar JSON ("x", 42, true) is valid JSON but would null every field of
  // an existing profile — only a plain object is a real payload.
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;

  // Whitelist per field — the client can never write another user's row (id
  // comes from the session) nor any column outside this set.
  const values = {
    displayName: str(body.displayName),
    sex: str(body.sex),
    age: num(body.age),
    bodyHeightCm: num(body.heightCm),
    bodyWeightKg: num(body.weightKg),
    bodyFatPct: num(body.bodyFatPct),
    activityLevel: str(body.activityLevel),
    latestBmr: num(body.bmr),
    latestTdee: num(body.tdee),
    bmrFormula: str(body.bmrFormula),
    unitsPreference: str(body.units) ?? "kg",
    locale: str(body.locale),
    clockFormat: str(body.clockFormat),
  };

  await db
    .insert(userProfile)
    .values({ id: session.user.id, ...values })
    .onConflictDoUpdate({
      target: userProfile.id,
      set: { ...values, updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true });
};
