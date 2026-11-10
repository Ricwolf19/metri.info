import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { signUnsubscribeToken, verifyUnsubscribeToken } from "./unsubscribe";

describe("unsubscribe tokens", () => {
  beforeEach(() => {
    vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-a");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips the user id", () => {
    const token = signUnsubscribeToken("user_123");
    expect(token).toMatch(/^[\w-]+\.[\w-]+$/);
    expect(verifyUnsubscribeToken(token)).toBe("user_123");
  });

  it("rejects a tampered signature", () => {
    const token = signUnsubscribeToken("user_123")!;
    const [id, sig] = token.split(".");
    const flipped = `${sig[0] === "A" ? "B" : "A"}${sig.slice(1)}`;
    expect(verifyUnsubscribeToken(`${id}.${flipped}`)).toBeNull();
  });

  it("rejects another user's id under a valid signature", () => {
    const sig = signUnsubscribeToken("user_123")!.split(".")[1];
    const otherId = Buffer.from("user_456").toString("base64url");
    expect(verifyUnsubscribeToken(`${otherId}.${sig}`)).toBeNull();
  });

  it("rejects tokens minted with a different secret", () => {
    const token = signUnsubscribeToken("user_123");
    vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-b");
    expect(verifyUnsubscribeToken(token)).toBeNull();
  });

  it("rejects malformed input", () => {
    for (const bad of [
      null,
      undefined,
      42,
      "",
      "abc",
      "a.b.c",
      ".sig",
      "id.",
    ]) {
      expect(verifyUnsubscribeToken(bad)).toBeNull();
    }
  });

  it("mints nothing and accepts nothing without a secret", () => {
    const token = signUnsubscribeToken("user_123");
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    expect(signUnsubscribeToken("user_123")).toBeNull();
    expect(verifyUnsubscribeToken(token)).toBeNull();
  });
});
