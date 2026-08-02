import { describe, expect, it } from "vitest";

import {
  isValidationError,
  LIMITS,
  parseCursor,
  parsePush,
  type PushRow,
} from "./contract";

/** Fixed "now" so clamping is deterministic — never the real clock in tests. */
const NOW = 1_750_000_000_000;

const change = (over: Partial<PushRow> = {}): PushRow => ({
  table: "set_logs",
  id: "row-1",
  updatedAt: NOW - 1_000,
  data: { reps: 5 },
  ...over,
});

const push = (body: unknown) => parsePush(body, NOW);

describe("parsePush — shape and identity", () => {
  it("rejects a non-object body", () => {
    expect(push(null)).toEqual({
      error: "bad_request",
      detail: "body must be an object",
    });
    expect(isValidationError(push("nope"))).toBe(true);
  });

  it("accepts a valid change and passes it through", () => {
    const parsed = push({ changes: [change()] });
    expect(parsed).toEqual({
      rows: [change()],
      deletions: [],
      origin: null,
    });
  });

  it("treats missing arrays as empty", () => {
    expect(push({})).toEqual({ rows: [], deletions: [], origin: null });
  });

  it("rejects present-but-non-array changes/deletions", () => {
    expect(push({ changes: "corrupt" })).toEqual({
      error: "bad_request",
      detail: "changes must be an array",
    });
    expect(push({ deletions: {} })).toEqual({
      error: "bad_request",
      detail: "deletions must be an array",
    });
  });

  it("rejects a table outside the allow-list", () => {
    const parsed = push({ changes: [change({ table: "users" })] });
    expect(parsed).toEqual({
      error: "bad_request",
      detail: "unknown table: users",
    });
  });

  it("rejects empty and oversized row ids", () => {
    expect(isValidationError(push({ changes: [change({ id: "" })] }))).toBe(
      true,
    );
    expect(
      isValidationError(push({ changes: [change({ id: "x".repeat(129) })] })),
    ).toBe(true);
  });
});

describe("parsePush — timestamps", () => {
  it("rejects non-finite, zero and negative updatedAt", () => {
    for (const updatedAt of [Number.NaN, 0, -5, "yesterday"] as const) {
      const parsed = push({
        changes: [change({ updatedAt: updatedAt as number })],
      });
      expect(parsed).toEqual({
        error: "bad_request",
        detail: "invalid updatedAt",
      });
    }
  });

  it("clamps a far-future updatedAt to now + skew instead of rejecting", () => {
    const parsed = push({
      changes: [change({ updatedAt: NOW + 10 * 60 * 1000 })],
    });
    if (isValidationError(parsed)) throw new Error("expected a parsed push");
    expect(parsed.rows[0].updatedAt).toBe(NOW + LIMITS.clockSkewMs);
  });

  it("leaves a timestamp within the skew window untouched", () => {
    const soon = NOW + 60_000;
    const parsed = push({ changes: [change({ updatedAt: soon })] });
    if (isValidationError(parsed)) throw new Error("expected a parsed push");
    expect(parsed.rows[0].updatedAt).toBe(soon);
  });
});

describe("parsePush — size limits", () => {
  it("rejects more than LIMITS.batch items before validating them", () => {
    const parsed = push({
      changes: Array.from({ length: LIMITS.batch + 1 }, () => ({})),
    });
    expect(parsed).toEqual({
      error: "payload_too_large",
      detail: `max ${LIMITS.batch} items`,
    });
  });

  it("rejects a row whose serialized data exceeds the byte limit", () => {
    const parsed = push({
      changes: [change({ data: { blob: "a".repeat(LIMITS.rowBytes) } })],
    });
    expect(parsed).toEqual({
      error: "payload_too_large",
      detail: "row row-1 exceeds limit",
    });
  });

  it("rejects unserializable (circular) data as too large", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(
      isValidationError(push({ changes: [change({ data: circular })] })),
    ).toBe(true);
  });
});

describe("parsePush — duplicate (table,id) collapse", () => {
  it("keeps only the newest change for a duplicated key", () => {
    const older = change({ updatedAt: NOW - 5_000, data: { reps: 3 } });
    const newer = change({ updatedAt: NOW - 1_000, data: { reps: 8 } });
    const parsed = push({ changes: [older, newer] });
    if (isValidationError(parsed)) throw new Error("expected a parsed push");
    expect(parsed.rows).toEqual([newer]);
  });

  it("lets a newer deletion beat an older change for the same key", () => {
    const parsed = push({
      changes: [change({ updatedAt: NOW - 5_000 })],
      deletions: [{ table: "set_logs", id: "row-1", deletedAt: NOW - 1_000 }],
    });
    if (isValidationError(parsed)) throw new Error("expected a parsed push");
    expect(parsed.rows).toEqual([]);
    expect(parsed.deletions).toEqual([
      { table: "set_logs", id: "row-1", deletedAt: NOW - 1_000 },
    ]);
  });

  it("lets a newer change beat an older deletion for the same key", () => {
    const parsed = push({
      changes: [change({ updatedAt: NOW - 1_000 })],
      deletions: [{ table: "set_logs", id: "row-1", deletedAt: NOW - 5_000 }],
    });
    if (isValidationError(parsed)) throw new Error("expected a parsed push");
    expect(parsed.deletions).toEqual([]);
    expect(parsed.rows).toHaveLength(1);
  });

  it("on an exact timestamp tie, the deletion wins (processed last, >=)", () => {
    const ts = NOW - 1_000;
    const parsed = push({
      changes: [change({ updatedAt: ts })],
      deletions: [{ table: "set_logs", id: "row-1", deletedAt: ts }],
    });
    if (isValidationError(parsed)) throw new Error("expected a parsed push");
    expect(parsed.rows).toEqual([]);
    expect(parsed.deletions).toHaveLength(1);
  });
});

describe("parsePush — deviceId", () => {
  it("carries a valid deviceId through as origin", () => {
    const parsed = push({ deviceId: "dev-a", changes: [change()] });
    if (isValidationError(parsed)) throw new Error("expected a parsed push");
    expect(parsed.origin).toBe("dev-a");
  });

  it("rejects a non-string or oversized deviceId", () => {
    expect(push({ deviceId: 123, changes: [change()] })).toEqual({
      error: "bad_request",
      detail: "invalid deviceId",
    });
    expect(
      isValidationError(push({ deviceId: "x".repeat(129), changes: [] })),
    ).toBe(true);
  });
});

describe("parseCursor", () => {
  it("treats a missing or null since as a full read", () => {
    expect(parseCursor(null)).toEqual({ since: null, deviceId: null });
    expect(parseCursor({})).toEqual({ since: null, deviceId: null });
    expect(parseCursor({ since: null })).toEqual({
      since: null,
      deviceId: null,
    });
  });

  it("passes a valid ISO cursor and deviceId through", () => {
    const iso = "2026-07-28T22:10:00.000Z";
    expect(parseCursor({ since: iso, deviceId: "dev-a" })).toEqual({
      since: iso,
      deviceId: "dev-a",
    });
  });

  it("rejects an invalid deviceId on pull too", () => {
    expect(isValidationError(parseCursor({ deviceId: 42 }))).toBe(true);
  });

  it("rejects a non-string or unparseable cursor instead of resyncing", () => {
    expect(isValidationError(parseCursor({ since: 123 }))).toBe(true);
    expect(isValidationError(parseCursor({ since: "not-a-date" }))).toBe(true);
  });
});
