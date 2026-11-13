import { describe, expect, it } from "vitest";

import { parseServiceAccount } from "./google-account";
import { createLimiter } from "./limiter";

describe("createLimiter", () => {
  it("runs at most n at once, in order, and drops none", async () => {
    const limit = createLimiter(2);
    let active = 0;
    let peak = 0;
    const started: number[] = [];
    const tasks = Array.from({ length: 6 }, (_, i) =>
      limit(async () => {
        started.push(i);
        active++;
        peak = Math.max(peak, active);
        await new Promise((r) => setTimeout(r, 5));
        active--;
        return i;
      }),
    );
    expect(await Promise.all(tasks)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(peak).toBe(2);
    expect(started).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("rejects only the failing caller and frees its slot", async () => {
    const limit = createLimiter(1);
    const failing = limit(() => {
      throw new Error("boom");
    });
    const after = limit(async () => "ok");
    await expect(failing).rejects.toThrow("boom");
    await expect(after).resolves.toBe("ok");
  });
});

describe("parseServiceAccount", () => {
  const key = {
    client_email: "a@b.iam.gserviceaccount.com",
    private_key: "-----BEGIN\\nKEY\\n-----END",
  };

  it("reads raw JSON and base64, and restores escaped newlines", () => {
    const raw = JSON.stringify(key);
    expect(parseServiceAccount(raw)?.private_key).toBe(
      "-----BEGIN\nKEY\n-----END",
    );
    expect(
      parseServiceAccount(Buffer.from(raw).toString("base64"))?.client_email,
    ).toBe(key.client_email);
  });

  it("returns null for anything unusable", () => {
    expect(parseServiceAccount(undefined)).toBeNull();
    expect(parseServiceAccount("{nope")).toBeNull();
    expect(
      parseServiceAccount(JSON.stringify({ client_email: "x" })),
    ).toBeNull();
  });
});
