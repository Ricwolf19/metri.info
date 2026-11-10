import { sql } from "drizzle-orm";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { GET as cron } from "@/app/api/cron/monthly-report/route";
import { POST as oneClickUnsubscribe } from "@/app/api/releases/unsubscribe/route";
import { db } from "@/lib/db";
import {
  signUnsubscribeToken,
  verifyUnsubscribeToken,
} from "@/lib/emails/unsubscribe";

import { demoReportInput } from "./fixtures";
import { sendMonthlyEmails } from "./send";

/**
 * The monthly job end to end: real SQL on PGlite, the real report and PDF,
 * Resend mocked. What matters here is who gets what, and that nobody on the
 * list gets an empty report or the same month twice.
 */

const { emailSend } = vi.hoisted(() => ({ emailSend: vi.fn() }));

vi.mock("next/cache", () => ({
  cacheTag: () => undefined,
  cacheLife: () => undefined,
  revalidateTag: () => undefined,
}));

vi.mock("@sentry/nextjs", () => ({ captureException: () => undefined }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: emailSend };
  },
}));

vi.mock("@/lib/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite();
  await client.exec(`
    create table "user" (
      "id" text primary key,
      "name" text not null,
      "email" text not null unique,
      "email_verified" boolean default false not null,
      "plan" text default 'free' not null,
      "release_emails" boolean default true not null,
      "monthly_report_emails" boolean,
      "created_at" timestamp default now() not null,
      "updated_at" timestamp default now() not null
    );
    create table "user_profile" (
      "id" text primary key references "user"("id") on delete cascade,
      "locale" text,
      "sex" text,
      "units_preference" text default 'kg' not null
    );
    create table "sync_row" (
      "user_id" text not null references "user"("id") on delete cascade,
      "table_name" text not null,
      "row_id" text not null,
      "data" jsonb,
      "deleted" boolean default false not null,
      "origin" text,
      "updated_at" timestamp not null,
      "server_updated_at" timestamp default now() not null,
      primary key ("user_id", "table_name", "row_id")
    );
    create table "calculation_log" (
      "id" text primary key,
      "user_id" text references "user"("id") on delete cascade,
      "calculator_type" text not null,
      "inputs" jsonb not null,
      "results" jsonb not null,
      "created_at" timestamp default now() not null
    );
    create table "quiz_attempt" (
      "id" text primary key,
      "user_id" text not null references "user"("id") on delete cascade,
      "scores" jsonb not null,
      "misses" jsonb,
      "asked" integer not null,
      "created_at" timestamptz default now() not null
    );
    create table "monthly_report" (
      "user_id" text not null references "user"("id") on delete cascade,
      "period" text not null,
      "kind" text not null,
      "sent_at" timestamptz default now() not null,
      primary key ("user_id", "period")
    );
    create table "app_release" (
      "id" text primary key,
      "version" text not null unique,
      "tag" text not null unique,
      "runtime_version" text not null,
      "apk_url" text not null,
      "sha256" text not null,
      "size_bytes" bigint not null,
      "notes" text default '' not null,
      "release_url" text not null,
      "published_at" timestamptz not null,
      "notified_at" timestamptz,
      "notify_cursor" text,
      "created_at" timestamptz default now() not null
    );
    insert into "app_release" ("id","version","tag","runtime_version","apk_url","sha256","size_bytes","release_url","published_at")
    values ('r1','1.17.0','metri-v1.17.0','rt','https://x/a.apk','s',1,'https://x/r','2026-11-03T00:00:00Z');
  `);
  return { db: drizzle(client) };
});

const FIRST_RUN = new Date("2026-11-02T15:00:00Z");
const FINAL_RUN = new Date("2026-11-04T15:00:00Z");

type Sent = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: Buffer }[];
  headers: Record<string, string>;
};

const sent = (): Sent[] =>
  emailSend.mock.calls.map(([payload]) => payload as Sent);
const to = (email: string) => sent().find((m) => m.to === email);

const addUser = async (
  id: string,
  options: {
    plan?: string;
    monthly?: boolean | null;
    verified?: boolean;
    locale?: string;
  } = {},
) => {
  const { plan = "free", monthly = true, verified = true, locale } = options;
  await db.execute(sql`
    insert into "user" ("id","name","email","email_verified","plan","monthly_report_emails")
    values (${id}, ${id}, ${`${id}@x.dev`}, ${verified}, ${plan}, ${monthly})
  `);
  if (locale)
    await db.execute(
      sql`insert into "user_profile" ("id","locale") values (${id}, ${locale})`,
    );
};

const addRow = (user: string, table: string, id: string, data: object) =>
  db.execute(sql`
    insert into "sync_row" ("user_id","table_name","row_id","data","updated_at")
    values (${user}, ${table}, ${id}, ${JSON.stringify(data)}::jsonb, now())
  `);

/** Puts the demo lifter's four months into an account's sync mirror. */
const addHistory = async (user: string) => {
  const demo = demoReportInput("2026-10");
  for (const s of demo.sessions)
    await addRow(user, "workout_logs", s.id, {
      status: "completed",
      started_at: Date.parse(`${s.date}T18:00:00Z`),
      duration_seconds: s.durationSeconds,
    });
  let n = 0;
  for (const s of demo.sets.filter((set) => set.reps > 0))
    await addRow(user, "set_logs", `set-${n++}`, {
      workout_log_id: `${s.date}-log`,
      exercise_id: s.exerciseId,
      reps: s.reps,
      weight_kg: s.weightKg,
      rir: s.rir,
      is_warmup: false,
      is_failure: false,
      created_at: s.at,
    });
  for (const w of demo.weighIns)
    await addRow(user, "body_metrics", w.date, {
      date: w.date,
      weight_kg: w.weightKg,
    });
};

const flag = async (id: string, column: "release" | "monthly") => {
  const { rows } = await db.execute<{ value: boolean | null }>(
    column === "release"
      ? sql`select "release_emails" as value from "user" where id = ${id}`
      : sql`select "monthly_report_emails" as value from "user" where id = ${id}`,
  );
  return rows[0]?.value;
};

beforeAll(() => {
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-test-secret-test-secret");
  vi.stubEnv("CRON_SECRET", "cron-secret");
});

afterAll(() => {
  vi.unstubAllEnvs();
});

beforeEach(async () => {
  emailSend.mockReset();
  emailSend.mockResolvedValue({ data: { id: "e1" }, error: null });
  await db.execute(sql`delete from "user"`);
});

describe("who gets what", () => {
  it("sends a report with its PDF to a Premium account with data", async () => {
    await addUser("lifter", { plan: "premium" });
    await addHistory("lifter");

    const outcome = await sendMonthlyEmails(FIRST_RUN);

    expect(outcome).toMatchObject({
      period: "2026-10",
      reports: 1,
      tips: 0,
      complete: true,
    });
    const mail = to("lifter@x.dev");
    expect(mail?.subject).toBe("Your Metri report for October 2026");
    const [attachment] = mail?.attachments ?? [];
    expect(attachment.filename).toBe("metri-report-2026-10.pdf");
    expect(attachment.content.subarray(0, 5).toString()).toBe("%PDF-");
  }, 60_000);

  it("keeps absolute body weight out of the email body", async () => {
    await addUser("lifter", { plan: "premium" });
    await addHistory("lifter");
    await sendMonthlyEmails(FIRST_RUN);
    const mail = to("lifter@x.dev");
    expect(mail?.text).toContain("Weight change");
    expect(mail?.text).not.toMatch(/8[0-9]\.\d kg/);
  }, 60_000);

  it("sends tips, not an empty report, to a free account", async () => {
    await addUser("free-user", { locale: "es" });

    const outcome = await sendMonthlyEmails(FIRST_RUN);

    expect(outcome).toMatchObject({ reports: 0, tips: 1 });
    const mail = to("free-user@x.dev");
    expect(mail?.subject).toBe("Tu mes en Metri: 3 cosas para probar");
    expect(mail?.attachments).toBeUndefined();
    expect(mail?.text).toContain("1.17.0");
    expect(mail?.text).toContain("Hacer el test de conocimientos");
  }, 30_000);

  it("personalizes tips from what the account did on the site", async () => {
    await addUser("calc-user");
    await db.execute(sql`
      insert into "calculation_log" ("id","user_id","calculator_type","inputs","results","created_at")
      values ('c1','calc-user','tdee','{}','{}','2026-10-10'),
             ('c2','calc-user','tdee','{}','{}','2026-10-11'),
             ('c3','calc-user','tdee','{}','{}','2026-09-11')
    `);
    await db.execute(sql`
      insert into "quiz_attempt" ("id","user_id","scores","asked")
      values ('q1','calc-user','{"nutrition":4,"training":1,"body":4,"fundamentals":4}',32)
    `);

    await sendMonthlyEmails(FIRST_RUN);

    const text = to("calc-user@x.dev")?.text ?? "";
    expect(text).toContain("You saved 2 calculations in October 2026.");
    expect(text).toContain("Most used: TDEE");
    expect(text).toContain("knowledge check says");
    expect(text).not.toContain("Take the knowledge check");
  }, 30_000);

  it("waits for a late sync before giving a Premium account tips", async () => {
    await addUser("no-sync", { plan: "premium" });

    expect(await sendMonthlyEmails(FIRST_RUN)).toMatchObject({
      deferred: 1,
      tips: 0,
    });
    expect(emailSend).not.toHaveBeenCalled();

    expect(await sendMonthlyEmails(FINAL_RUN)).toMatchObject({
      deferred: 0,
      tips: 1,
    });
    expect(to("no-sync@x.dev")?.text).toContain("no training data");
    expect(to("no-sync@x.dev")?.attachments).toBeUndefined();
  }, 30_000);

  it("emails nobody who didn't opt in or isn't verified", async () => {
    await addUser("never-asked", { monthly: null });
    await addUser("declined", { monthly: false });
    await addUser("unverified", { verified: false });

    await sendMonthlyEmails(FIRST_RUN);

    expect(emailSend).not.toHaveBeenCalled();
  });
});

describe("repeat runs", () => {
  it("never emails the same month twice", async () => {
    await addUser("once");

    await sendMonthlyEmails(FIRST_RUN);
    await sendMonthlyEmails(FINAL_RUN);

    expect(emailSend).toHaveBeenCalledTimes(1);
    expect(emailSend.mock.calls[0][1]).toEqual({
      idempotencyKey: "monthly-2026-10-once",
    });
  }, 30_000);

  it("retries next run whoever failed, without stopping the others", async () => {
    await addUser("a-fails");
    await addUser("b-works");
    emailSend.mockResolvedValueOnce({
      data: null,
      error: { name: "validation_error", message: "bad address" },
    });

    expect(await sendMonthlyEmails(FIRST_RUN)).toMatchObject({
      failed: 1,
      tips: 1,
    });
    expect(to("b-works@x.dev")).toBeDefined();

    emailSend.mockClear();
    expect(await sendMonthlyEmails(FINAL_RUN)).toMatchObject({
      failed: 0,
      tips: 1,
    });
    expect(sent().map((m) => m.to)).toEqual(["a-fails@x.dev"]);
  }, 30_000);

  it("ends the run when the provider keeps failing", async () => {
    for (const id of ["u1", "u2", "u3", "u4"]) await addUser(id);
    emailSend.mockResolvedValue({
      data: null,
      error: { name: "application_error", message: "down" },
    });

    expect(await sendMonthlyEmails(FIRST_RUN)).toMatchObject({
      failed: 3,
      complete: false,
    });
    expect(emailSend).toHaveBeenCalledTimes(3);
  }, 30_000);
});

describe("unsubscribing", () => {
  it("a monthly link turns off monthly emails and nothing else", async () => {
    await addUser("sub");
    await sendMonthlyEmails(FIRST_RUN);
    const header = to("sub@x.dev")?.headers["List-Unsubscribe"] ?? "";
    expect(header).toContain("list=monthly");
    const url = header.slice(1, -1);

    const res = await oneClickUnsubscribe(new Request(url, { method: "POST" }));

    expect(res.status).toBe(200);
    expect(await flag("sub", "monthly")).toBe(false);
    expect(await flag("sub", "release")).toBe(true);
  }, 30_000);

  it("tokens are scoped to their list", () => {
    const monthly = signUnsubscribeToken("u1", "monthly");
    const release = signUnsubscribeToken("u1");
    expect(verifyUnsubscribeToken(monthly, "monthly")).toBe("u1");
    expect(verifyUnsubscribeToken(monthly)).toBeNull();
    expect(verifyUnsubscribeToken(release, "monthly")).toBeNull();
  });
});

describe("the cron route", () => {
  it("refuses a request without the secret", async () => {
    const res = await cron(new Request("https://x/api/cron/monthly-report"));
    expect(res.status).toBe(401);
    expect(emailSend).not.toHaveBeenCalled();
  });
});
