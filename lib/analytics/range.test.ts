import { describe, expect, it } from "vitest";

import {
  clampWindow,
  fillDays,
  lastDays,
  MAX_RANGE_DAYS,
  parseRange,
  searchWith,
  todayIn,
  windowLabel,
} from "./range";

const TODAY = "2026-11-12";

describe("parseRange", () => {
  it("defaults to the last 30 days, today included", () => {
    expect(parseRange({}, TODAY)).toEqual({
      preset: "30d",
      startDate: "2026-10-14",
      endDate: TODAY,
      days: 30,
    });
  });

  it("reads a preset and ignores one it doesn't know", () => {
    expect(parseRange({ range: "7d" }, TODAY).startDate).toBe("2026-11-06");
    expect(parseRange({ range: "2y" }, TODAY).preset).toBe("30d");
  });

  it("lets a custom span win, swapped when reversed, never past today", () => {
    expect(
      parseRange({ range: "7d", from: "2026-11-10", to: "2026-11-01" }, TODAY),
    ).toEqual({
      preset: "custom",
      startDate: "2026-11-01",
      endDate: "2026-11-10",
      days: 10,
    });
    expect(
      parseRange({ from: "2026-11-01", to: "2027-01-01" }, TODAY).endDate,
    ).toBe(TODAY);
  });

  it("opens either end and rejects days that don't exist", () => {
    expect(parseRange({ from: "2026-11-01" }, TODAY).endDate).toBe(TODAY);
    expect(parseRange({ to: "2026-10-31" }, TODAY).startDate).toBe(
      "2026-10-02",
    );
    expect(parseRange({ from: "2026-02-30" }, TODAY).preset).toBe("30d");
  });

  it("cuts an over-long span at its start", () => {
    const w = parseRange({ from: "2020-01-01", to: TODAY }, TODAY);
    expect(w.days).toBe(MAX_RANGE_DAYS);
    expect(w.endDate).toBe(TODAY);
  });
});

describe("window helpers", () => {
  it("clamps to an upstream's history and says so", () => {
    const { window, clamped } = clampWindow(
      parseRange({ range: "365d" }, TODAY),
      90,
    );
    expect(clamped).toBe(true);
    expect(window).toMatchObject({
      startDate: "2026-08-15",
      endDate: TODAY,
      days: 90,
    });
    expect(clampWindow(lastDays(7, TODAY), 90).clamped).toBe(false);
  });

  it("fills every day of the window, oldest first", () => {
    const days = fillDays(lastDays(3, TODAY), new Map([["2026-11-11", 4]]));
    expect(days).toEqual([
      { date: "2026-11-10", value: 0 },
      { date: "2026-11-11", value: 4 },
      { date: "2026-11-12", value: 0 },
    ]);
  });

  it("keeps other params, drops the default preset", () => {
    expect(
      searchWith({ page: "tools", range: "7d" }, { range: "30d", from: null }),
    ).toBe("?page=tools");
    expect(searchWith({}, { range: "90d" })).toBe("?range=90d");
  });

  it("labels presets and spans", () => {
    expect(windowLabel(parseRange({ range: "365d" }, TODAY))).toBe(
      "Last 12 months",
    );
    expect(
      windowLabel(parseRange({ from: "2026-10-03", to: TODAY }, TODAY)),
    ).toBe("Oct 3 – Nov 12, 2026");
  });

  it("dates today on the operator's clock, not UTC's", () => {
    // 03:00 UTC on the 13th is still the evening of the 12th in Mexico City.
    expect(
      todayIn("America/Mexico_City", new Date("2026-11-13T03:00:00Z")),
    ).toBe(TODAY);
  });
});
