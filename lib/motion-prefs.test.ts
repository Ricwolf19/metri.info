import { afterEach, describe, expect, it, vi } from "vitest";

import { readMotionPaused, setMotionPaused } from "./motion-prefs";

const fakeStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
};

describe("motion pause", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is off until the reader pauses, and remembered after", () => {
    const events: string[] = [];
    vi.stubGlobal("localStorage", fakeStorage());
    vi.stubGlobal("window", {
      dispatchEvent: (e: Event) => events.push(e.type),
    });
    expect(readMotionPaused()).toBe(false);
    setMotionPaused(true);
    expect(readMotionPaused()).toBe(true);
    setMotionPaused(false);
    expect(readMotionPaused()).toBe(false);
    // Every change tells the open strips at once.
    expect(events).toEqual(["metri:motion-paused", "metri:motion-paused"]);
  });

  it("reads as playing, and still notifies, when storage is refused", () => {
    const events: string[] = [];
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    });
    vi.stubGlobal("window", {
      dispatchEvent: (e: Event) => events.push(e.type),
    });
    expect(readMotionPaused()).toBe(false);
    setMotionPaused(true);
    expect(events).toEqual(["metri:motion-paused"]);
  });
});
