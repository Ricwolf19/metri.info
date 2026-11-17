import { afterEach, describe, expect, it, vi } from "vitest";

import { event } from "./logger";

afterEach(() => vi.restoreAllMocks());

describe("event", () => {
  it("logs an error's cause and code, not just the wrapper", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pg = Object.assign(new Error('relation "roadmap" does not exist'), {
      code: "42P01",
    });
    event.warn("roadmap.read-failed", {
      error: new Error("Failed query: select …", { cause: pg }),
    });
    const fields = warn.mock.calls[0][1] as {
      error: { message: string; cause: { message: string; code: string } };
    };
    expect(fields.error.message).toContain("Failed query");
    expect(fields.error.cause).toMatchObject({
      message: 'relation "roadmap" does not exist',
      code: "42P01",
    });
  });
});
