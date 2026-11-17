import { afterEach, describe, expect, it, vi } from "vitest";

import { scrollReachBands, ZONE_COLS } from "./heat";
import { parseHeatmapParams } from "./heatmaps";
import { lastDays } from "./range";
import { underperforming, strikingDistance } from "./search";
import {
  simBehaviorSummary,
  simDailyVisits,
  simFunnel,
  simHeatPoints,
  simHeatZones,
  simInspections,
  simScrollDepth,
  simSearchRows,
  simSentryIssues,
  simulating,
} from "./simulate";

const TODAY = "2026-11-13";

afterEach(() => vi.unstubAllEnvs());

describe("simulating", () => {
  it("is only ever on for a dev server without keys", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(simulating(false)).toBe(true);
    expect(simulating(true)).toBe(false);
    vi.stubEnv("NODE_ENV", "production");
    expect(simulating(false)).toBe(false);
    vi.stubEnv("NODE_ENV", "test");
    expect(simulating(false)).toBe(false);
  });
});

describe("simulated numbers", () => {
  it("are stable: the same window gives the same data", () => {
    expect(simBehaviorSummary(lastDays(30, TODAY))).toEqual(
      simBehaviorSummary(lastDays(30, TODAY)),
    );
  });

  it("agree across windows on the days they share, and with their totals", () => {
    const week = simDailyVisits(lastDays(7, TODAY)).pageviews;
    const month = simDailyVisits(lastDays(30, TODAY)).pageviews;
    expect(month.slice(-7)).toEqual(week);
    expect(simBehaviorSummary(lastDays(7, TODAY)).pageviews).toBe(
      week.reduce((n, d) => n + d.value, 0),
    );
  });

  it("never go negative, and funnels never rise", () => {
    const w = lastDays(90, TODAY);
    for (const v of Object.values(simBehaviorSummary(w)))
      expect(v).toBeGreaterThanOrEqual(0);
    const steps = simFunnel("signup", 4, w);
    for (let i = 1; i < steps.length; i++)
      expect(steps[i]).toBeLessThanOrEqual(steps[i - 1]);
  });

  it("put heat on PostHog's own grid", () => {
    const points = simHeatPoints(
      parseHeatmapParams({ device: "mobile" }),
      lastDays(30, TODAY),
    );
    expect(points.some((p) => p.fixed)).toBe(true);
    for (const p of points) {
      expect(Math.round(p.x * 100) / 100).toBe(p.x);
      expect(p.y % 16).toBe(0);
    }
  });

  it("count the same interactions per hover zone, never more people than clicks", () => {
    const params = parseHeatmapParams({ device: "mobile", count: "total" });
    const span = lastDays(30, TODAY);
    const points = simHeatPoints(params, span);
    const zones = simHeatZones(params, span);
    const sum = (xs: readonly { count: number }[]) =>
      xs.reduce((n, x) => n + x.count, 0);
    expect(sum(zones)).toBe(sum(points));
    for (const z of zones) {
      expect(z.people).toBeGreaterThanOrEqual(1);
      expect(z.people).toBeLessThanOrEqual(z.count);
      expect(z.col).toBeLessThan(ZONE_COLS);
    }
  });

  it("make scroll depth start at everyone and fall", () => {
    const bands = scrollReachBands(
      simScrollDepth(parseHeatmapParams({}), lastDays(30, TODAY)),
    );
    expect(bands[0].reach).toBe(1);
    expect(bands.at(-1)!.reach).toBeLessThan(0.2);
  });

  it("give both search opportunity lists something to show", () => {
    const queries = simSearchRows(lastDays(90, TODAY), ["query"]);
    expect(underperforming(queries).length).toBeGreaterThan(0);
    expect(strikingDistance(queries).length).toBeGreaterThan(0);
  });

  it("index the home pages and never link a made-up issue", () => {
    const now = new Date(`${TODAY}T12:00:00Z`);
    const [home] = simInspections(["https://metri.info/"], now);
    expect(home.verdict).toBe("PASS");
    for (const issue of simSentryIssues(lastDays(14, TODAY), 10))
      expect(issue.permalink).toBeNull();
  });
});
