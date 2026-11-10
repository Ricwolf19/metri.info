import { afterEach, describe, expect, it, vi } from "vitest";

import { readQuizAutoAdvance, setQuizAutoAdvance } from "./auto-advance";

const fakeStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
};

describe("quiz auto-advance", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is on until the reader turns it off, and remembered after", () => {
    const events: string[] = [];
    vi.stubGlobal("localStorage", fakeStorage());
    vi.stubGlobal("window", {
      dispatchEvent: (e: Event) => events.push(e.type),
    });
    expect(readQuizAutoAdvance()).toBe(true);
    setQuizAutoAdvance(false);
    expect(readQuizAutoAdvance()).toBe(false);
    setQuizAutoAdvance(true);
    expect(readQuizAutoAdvance()).toBe(true);
    expect(events).toEqual([
      "metri:quiz-auto-advance",
      "metri:quiz-auto-advance",
    ]);
  });

  it("stays on when storage is refused", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("denied");
      },
    });
    expect(readQuizAutoAdvance()).toBe(true);
  });
});
