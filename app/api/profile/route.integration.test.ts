import { eq, sql } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

import { GET, PUT } from "./route";

/**
 * The release-email opt-out as the mobile app drives it: `releaseEmails` rides
 * the profile push, lives on `user` (not the profile row), and is written only
 * when it is a real boolean — a build that predates the field, or a malformed
 * body, must never flip someone's choice. Real SQL on PGlite, session stubbed.
 */

const { session } = vi.hoisted(() => ({
  session: {
    current: { user: { id: "u1" } } as { user: { id: string } } | null,
  },
}));

vi.mock("@/lib/auth/session", () => ({
  getSession: async () => session.current,
}));

vi.mock("@/lib/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite();
  await client.exec(`
    create table "user" (
      "id" text primary key,
      "email" text not null unique,
      "release_emails" boolean default true not null,
      "updated_at" timestamp default now() not null
    );
    create table "user_profile" (
      "id" text primary key references "user"("id") on delete cascade,
      "username" text unique,
      "display_name" text,
      "bio" text,
      "units_preference" text default 'kg' not null,
      "body_weight_kg" real,
      "body_height_cm" real,
      "sex" text,
      "age" integer,
      "body_fat_pct" real,
      "activity_level" text,
      "latest_bmr" real,
      "latest_tdee" real,
      "bmr_formula" text,
      "locale" text,
      "clock_format" text,
      "created_at" timestamp default now() not null,
      "updated_at" timestamp default now() not null
    );
  `);
  return { db: drizzle(client) };
});

const put = (body: unknown) =>
  PUT(
    new Request("http://test/api/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  );

const storedFlag = async () =>
  (
    await db
      .select({ v: user.releaseEmails })
      .from(user)
      .where(eq(user.id, "u1"))
  )[0]?.v;

beforeEach(async () => {
  session.current = { user: { id: "u1" } };
  await db.delete(user);
  // Raw SQL: the table here holds only the columns this route touches.
  await db.execute(
    sql`insert into "user" ("id", "email") values ('u1', 'u1@example.com')`,
  );
});

describe("/api/profile — releaseEmails", () => {
  it("defaults to on for an account that never chose", async () => {
    const body = await (await GET()).json();
    // No profile row yet: the flag still answers at the top level.
    expect(body).toMatchObject({ profile: null, releaseEmails: true });
  });

  it("persists an opt-out sent with the profile push", async () => {
    await put({ units: "kg", releaseEmails: false });
    expect(await storedFlag()).toBe(false);
    const body = await (await GET()).json();
    expect(body.releaseEmails).toBe(false);
    expect(body.profile.releaseEmails).toBe(false);
  });

  it.each([
    ["an older build that never sends it", { units: "kg" }],
    ["a string", { units: "kg", releaseEmails: "no" }],
    ["null", { units: "kg", releaseEmails: null }],
  ])("leaves the choice alone for %s", async (_label, body) => {
    await put({ releaseEmails: false });
    await put(body);
    expect(await storedFlag()).toBe(false);
  });

  it("refuses a caller without a session", async () => {
    session.current = null;
    expect((await put({ releaseEmails: false })).status).toBe(401);
    expect(await storedFlag()).toBe(true);
  });
});
