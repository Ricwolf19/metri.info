import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  normalizeProfileFields,
  profileRangeError,
} from "@/lib/account/profile-input";
import { event } from "@/lib/log/logger";
import { user, userProfile } from "@/lib/db/schema";

/**
 * Account profile for the mobile app — what makes a reinstall feel like the
 * same account (body metrics, preferences) instead of a first launch.
 * Session-gated only: this is account data, not premium training sync.
 *
 *   GET → the caller's profile row (or null when never written)
 *   PUT → full replace of the whitelisted fields: omitted, out-of-range or
 *         unknown-option fields are stored as null (units falls back to "kg"),
 *         unknown fields are ignored. The client always sends the complete
 *         profile. The whitelist and ranges live in
 *         `lib/account/profile-input.ts`, shared with the web settings form.
 *
 * `releaseEmails` (new-release announcements) lives on `user`, not the profile
 * row, and is the one field that is NOT full-replace: it is written only when
 * the body carries a boolean, so builds that predate it never flip it. GET
 * returns it inside `profile` (when a row exists) and at the top level.
 */

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

export const GET = async () => {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [[row], [account]] = await Promise.all([
    db
      .select()
      .from(userProfile)
      .where(eq(userProfile.id, session.user.id))
      .limit(1),
    db
      .select({ releaseEmails: user.releaseEmails })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1),
  ]);
  const releaseEmails = account?.releaseEmails ?? true;

  return NextResponse.json({
    profile: row ? { ...row, releaseEmails } : null,
    releaseEmails,
  });
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
  const fields = {
    displayName: body.displayName,
    sex: body.sex,
    age: body.age,
    bodyHeightCm: body.heightCm,
    bodyWeightKg: body.weightKg,
    bodyFatPct: body.bodyFatPct,
    activityLevel: body.activityLevel,
    bmrFormula: body.bmrFormula,
    unitsPreference: body.units,
    locale: body.locale,
    clockFormat: body.clockFormat,
  };
  // The app does not range-check before pushing; a dropped value is stored as
  // null, and this is the only trace of it.
  const dropped = profileRangeError(fields);
  if (dropped)
    event.info("profile.dropped-out-of-range", {
      userId: session.user.id,
      field: dropped,
    });

  const values = {
    ...normalizeProfileFields(fields),
    latestBmr: num(body.bmr),
    latestTdee: num(body.tdee),
  };

  await db
    .insert(userProfile)
    .values({ id: session.user.id, ...values })
    .onConflictDoUpdate({
      target: userProfile.id,
      set: { ...values, updatedAt: new Date() },
    });

  if (typeof body.releaseEmails === "boolean") {
    await db
      .update(user)
      .set({ releaseEmails: body.releaseEmails, updatedAt: new Date() })
      .where(eq(user.id, session.user.id));
  }

  return NextResponse.json({ ok: true });
};
