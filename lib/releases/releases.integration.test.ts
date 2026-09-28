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

import { GET as latestVersion } from "@/app/api/latest-version/route";
import { POST as notify } from "@/app/api/releases/notify/route";
import { POST as oneClickUnsubscribe } from "@/app/api/releases/unsubscribe/route";
import { db } from "@/lib/db";

import { signUnsubscribeToken, verifyUnsubscribeToken } from "./unsubscribe";

/**
 * The release pipeline end to end — webhook → GitHub (mocked fetch) → real
 * SQL on PGlite → Resend (mocked batch) — plus the public latest-version read
 * and the one-click unsubscribe. `next/cache` is stubbed: `use cache` is
 * inert outside Next, so every read here hits the DB/GitHub directly.
 */

const { batchSend, revalidateTag } = vi.hoisted(() => ({
  batchSend: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  cacheTag: () => undefined,
  cacheLife: () => undefined,
  revalidateTag,
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => undefined,
}));

vi.mock("resend", () => ({
  Resend: class {
    batch = { send: batchSend };
  },
}));

vi.mock("@/lib/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite();
  await client.exec(`
    create table "user" (
      "id" text primary key,
      "email" text not null unique,
      "email_verified" boolean default false not null,
      "release_emails" boolean default true not null,
      "created_at" timestamp default now() not null,
      "updated_at" timestamp default now() not null
    );
    create table "user_profile" (
      "id" text primary key references "user"("id") on delete cascade,
      "locale" text
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
  `);
  return { db: drizzle(client) };
});

const SECRET = "webhook-secret";
const TAG = "metri-v1.12.0";
const SHA = "a".repeat(64);
const API = "https://api.github.com/repos/Ricwolf19/metri";
const DOWNLOAD = "https://github.com/Ricwolf19/metri/releases/download";

const ghRelease = (tag: string, published: string, withManifest = true) => ({
  tag_name: tag,
  draft: false,
  prerelease: false,
  body: "### Features\n\n* **training:** plate math",
  published_at: published,
  assets: [
    {
      name: `metri-${tag.slice(7)}.apk`,
      browser_download_url: `${DOWNLOAD}/${tag}/metri-${tag.slice(7)}.apk`,
    },
    ...(withManifest
      ? [
          {
            name: "release.json",
            browser_download_url: `${DOWNLOAD}/${tag}/release.json`,
          },
        ]
      : []),
  ],
});

const manifest = (tag: string, overrides: Record<string, unknown> = {}) => ({
  version: tag.slice(7),
  tag,
  runtimeVersion: "fp-123",
  apk: `metri-${tag.slice(7)}.apk`,
  sha256: SHA,
  sizeBytes: 81_234_567,
  ...overrides,
});

/** URL → JSON body routing for the stubbed global fetch; unknown → 404. */
let routes: Record<string, unknown> = {};
const fetchMock = vi.fn(async (input: string | URL | Request) => {
  const url = typeof input === "string" ? input : input.toString();
  return url in routes
    ? Response.json(routes[url])
    : new Response("not found", { status: 404 });
});

const publishRelease = (
  tag: string,
  published: string,
  overrides: Record<string, unknown> = {},
) => {
  routes[`${API}/releases/tags/${tag}`] = ghRelease(tag, published);
  routes[`${DOWNLOAD}/${tag}/release.json`] = manifest(tag, overrides);
};

const callNotify = (body: unknown, auth: string | null = `Bearer ${SECRET}`) =>
  notify(
    new Request("https://metri.info/api/releases/notify", {
      method: "POST",
      headers: auth ? { authorization: auth } : {},
      body: JSON.stringify(body),
    }),
  );

const resetDb = async () => {
  await db.execute(sql`delete from "app_release"`);
  await db.execute(sql`delete from "user_profile"`);
  await db.execute(sql`delete from "user"`);
  await db.execute(sql`
    insert into "user" (id, email, email_verified, release_emails, created_at) values
      ('u1', 'en@x.dev', true, true, '2026-01-01'),
      ('u2', 'es@x.dev', true, true, '2026-01-01'),
      ('u3', 'unverified@x.dev', false, true, '2026-01-01'),
      ('u4', 'optedout@x.dev', true, false, '2026-01-01')
  `);
  await db.execute(sql`
    insert into "user_profile" (id, locale) values ('u2', 'es'), ('u4', 'es');
  `);
};

beforeAll(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("BETTER_AUTH_SECRET", "auth-secret");
  vi.stubEnv("RELEASE_WEBHOOK_SECRET", SECRET);
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterAll(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

beforeEach(async () => {
  routes = {};
  fetchMock.mockClear();
  batchSend.mockReset();
  batchSend.mockImplementation(async (messages: unknown[]) => ({
    data: { data: messages.map((_, i) => ({ id: `email-${i}` })) },
    error: null,
  }));
  revalidateTag.mockReset();
  await resetDb();
});

describe("POST /api/releases/notify — auth", () => {
  it("fails closed (503) while the secret is unset", async () => {
    vi.stubEnv("RELEASE_WEBHOOK_SECRET", "");
    const res = await callNotify({ tag: TAG });
    vi.stubEnv("RELEASE_WEBHOOK_SECRET", SECRET);
    expect(res.status).toBe(503);
  });

  it.each([null, "Bearer wrong", SECRET, `Bearer ${SECRET}x`])(
    "rejects authorization %s with 401",
    async (auth) => {
      const res = await callNotify({ tag: TAG }, auth);
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it.each([{}, { tag: 42 }, { tag: "apk-beta" }, { tag: "metri-v1.2/../x" }])(
    "rejects body %j with 400",
    async (body) => {
      expect((await callNotify(body)).status).toBe(400);
    },
  );
});

describe("POST /api/releases/notify — store + announce", () => {
  it("stores the release from GitHub and emails eligible users once", async () => {
    publishRelease(TAG, "2026-09-28T12:00:00Z");

    const res = await callNotify({ tag: TAG, version: "9.9.9" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ stored: true, emailed: 2 });
    expect(revalidateTag).toHaveBeenCalledWith("app-release", { expire: 0 });

    // Verified + opted-in only: u3 (unverified) and u4 (opted out) skipped.
    expect(batchSend).toHaveBeenCalledTimes(1);
    const [messages, options] = batchSend.mock.calls[0];
    expect(options).toEqual({ idempotencyKey: `release-${TAG}-after-start` });
    type Sent = {
      to: string;
      subject: string;
      html: string;
      text: string;
      headers: Record<string, string>;
    };
    const byTo: Record<string, Sent> = Object.fromEntries(
      (messages as Sent[]).map((m) => [m.to, m]),
    );
    expect(Object.keys(byTo).sort()).toEqual(["en@x.dev", "es@x.dev"]);
    expect(byTo["en@x.dev"].subject).toBe("Metri 1.12.0 is out");
    expect(byTo["es@x.dev"].subject).toBe("Ya salió Metri 1.12.0");

    const en = byTo["en@x.dev"];
    expect(en.html).toContain(`${DOWNLOAD}/${TAG}/metri-1.12.0.apk`);
    expect(en.html).not.toContain("__METRI_UNSUBSCRIBE_URL__");
    expect(en.headers["List-Unsubscribe-Post"]).toBe(
      "List-Unsubscribe=One-Click",
    );
    const token = /token=([\w.-]+)/.exec(en.headers["List-Unsubscribe"])?.[1];
    expect(verifyUnsubscribeToken(token)).toBe("u1");
    expect(en.html).toContain(`/unsubscribe?token=${token}`);
    expect(byTo["es@x.dev"].html).toContain("/es/cancelar-suscripcion?token=");

    // Stored from the manifest, not the body's "version".
    const rows = await db.execute(
      sql`select version, sha256, size_bytes, notified_at from app_release`,
    );
    expect(rows.rows).toHaveLength(1);
    expect(rows.rows[0]).toMatchObject({ version: "1.12.0", sha256: SHA });
    expect(rows.rows[0].notified_at).not.toBeNull();

    // Replay: stored again, emails nobody.
    const again = await callNotify({ tag: TAG });
    expect(await again.json()).toEqual({ stored: true, emailed: 0 });
    expect(batchSend).toHaveBeenCalledTimes(1);
  });

  it("leaves the release un-notified when a batch fails, so a replay retries", async () => {
    publishRelease(TAG, "2026-09-28T12:00:00Z");
    batchSend.mockResolvedValueOnce({
      data: null,
      error: { message: "boom", name: "internal_server_error" },
    });

    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    expect(await (await callNotify({ tag: TAG })).json()).toEqual({
      stored: true,
      emailed: 0,
    });
    expect(await (await callNotify({ tag: TAG })).json()).toEqual({
      stored: true,
      emailed: 2,
    });
    // Nothing was accepted, so the retry rebuilds the same batch under the
    // same key — Resend drops it if the first call did land after all.
    expect(batchSend.mock.calls.map((c) => c[1])).toEqual([
      { idempotencyKey: `release-${TAG}-after-start` },
      { idempotencyKey: `release-${TAG}-after-start` },
    ]);
  });

  it("resumes after the last accepted batch instead of re-mailing it", async () => {
    // 150 more recipients → two batches (100 + 52 with u1/u2).
    await db.execute(sql`
      insert into "user" (id, email, email_verified, created_at)
      select 'v' || lpad(i::text, 3, '0'), 'v' || i || '@x.dev', true, '2026-01-01'
      from generate_series(1, 150) as i
    `);
    publishRelease(TAG, "2026-09-28T12:00:00Z");
    batchSend
      .mockResolvedValueOnce({
        data: { data: Array(100).fill({}) },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: { message: "boom", name: "internal_server_error" },
      });

    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    expect(await (await callNotify({ tag: TAG })).json()).toEqual({
      stored: true,
      emailed: 100,
    });
    const retry = await (await callNotify({ tag: TAG })).json();
    expect(retry).toEqual({ stored: true, emailed: 52 });

    const [, second, third] = batchSend.mock.calls;
    const cursor = (batchSend.mock.calls[0][0] as { to: string }[]).length;
    expect(cursor).toBe(100);
    // The retry starts after the 100th id and never repeats one of them.
    expect(second[1]).toEqual(third[1]);
    const first = new Set(
      (batchSend.mock.calls[0][0] as { to: string }[]).map((m) => m.to),
    );
    expect((third[0] as { to: string }[]).some((m) => first.has(m.to))).toBe(
      false,
    );
  });

  it("waits and retries once when a batch is rate limited", async () => {
    publishRelease(TAG, "2026-09-28T12:00:00Z");
    batchSend.mockResolvedValueOnce({
      data: null,
      error: { message: "slow down", name: "rate_limit_exceeded" },
    });
    expect(await (await callNotify({ tag: TAG })).json()).toEqual({
      stored: true,
      emailed: 2,
    });
    expect(batchSend).toHaveBeenCalledTimes(2);
  });

  it("does not mail accounts created after the release was published", async () => {
    await db.execute(sql`
      insert into "user" (id, email, email_verified, created_at)
      values ('late', 'late@x.dev', true, '2026-12-01')
    `);
    publishRelease(TAG, "2026-09-28T12:00:00Z");
    await callNotify({ tag: TAG });
    const sent = (batchSend.mock.calls[0][0] as { to: string }[]).map(
      (m) => m.to,
    );
    expect(sent).not.toContain("late@x.dev");
  });

  it("refuses a manifest that does not match its release (422, nothing stored)", async () => {
    publishRelease(TAG, "2026-09-28T12:00:00Z", { sha256: "not-a-hash" });
    const res = await callNotify({ tag: TAG });
    expect(res.status).toBe(422);
    expect(batchSend).not.toHaveBeenCalled();
    const rows = await db.execute(sql`select 1 from app_release`);
    expect(rows.rows).toHaveLength(0);
  });

  it("404s a tag GitHub does not know", async () => {
    expect((await callNotify({ tag: "metri-v0.0.1" })).status).toBe(404);
  });
});

describe("GET /api/latest-version", () => {
  it("404s when neither the table nor GitHub has a release", async () => {
    routes[`${API}/releases?per_page=10`] = [
      ghRelease("metri-v1.0.0", "2026-01-01T00:00:00Z", false),
    ];
    const res = await latestVersion();
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "no_release" });
  });

  it("falls back to GitHub's newest release that carries release.json", async () => {
    routes[`${API}/releases?per_page=10`] = [
      ghRelease("metri-v1.13.0", "2026-10-01T00:00:00Z", false),
      ghRelease("metri-v1.12.0", "2026-09-28T12:00:00Z"),
    ];
    routes[`${DOWNLOAD}/metri-v1.12.0/release.json`] =
      manifest("metri-v1.12.0");
    const res = await latestVersion();
    expect(res.status).toBe(200);
    expect((await res.json()).version).toBe("1.12.0");
  });

  it("returns the newest stored release by publish date", async () => {
    publishRelease("metri-v1.12.0", "2026-09-28T12:00:00Z");
    publishRelease("metri-v1.11.0", "2026-09-01T12:00:00Z");
    await callNotify({ tag: "metri-v1.12.0" });
    await callNotify({ tag: "metri-v1.11.0" }); // stored later, published earlier

    const res = await latestVersion();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe(
      "public, s-maxage=300, stale-while-revalidate=3600",
    );
    expect(await res.json()).toEqual({
      version: "1.12.0",
      tag: "metri-v1.12.0",
      runtimeVersion: "fp-123",
      apkUrl: `${DOWNLOAD}/metri-v1.12.0/metri-1.12.0.apk`,
      sha256: SHA,
      sizeBytes: 81_234_567,
      notes: "### Features\n\n* **training:** plate math",
      publishedAt: "2026-09-28T12:00:00.000Z",
      releaseUrl:
        "https://github.com/Ricwolf19/metri/releases/tag/metri-v1.12.0",
    });
  });
});

describe("POST /api/releases/unsubscribe (one-click)", () => {
  const post = (token: string) =>
    oneClickUnsubscribe(
      new Request(
        `https://metri.info/api/releases/unsubscribe?token=${token}`,
        {
          method: "POST",
          body: "List-Unsubscribe=One-Click",
        },
      ),
    );

  const releaseEmails = async (id: string) =>
    (await db.execute(sql`select release_emails from "user" where id = ${id}`))
      .rows[0]?.release_emails;

  it("opts the signed user out", async () => {
    const res = await post(signUnsubscribeToken("u1")!);
    expect(res.status).toBe(200);
    expect(await releaseEmails("u1")).toBe(false);
    expect(await releaseEmails("u2")).toBe(true);
  });

  it("rejects a tampered token without touching anyone", async () => {
    const [, sig] = signUnsubscribeToken("u1")!.split(".");
    const forged = `${Buffer.from("u2").toString("base64url")}.${sig}`;
    expect((await post(forged)).status).toBe(400);
    expect(await releaseEmails("u2")).toBe(true);
  });
});
