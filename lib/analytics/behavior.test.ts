import { beforeEach, describe, expect, it, vi } from "vitest";

const calls: { query: string; values: Record<string, unknown> }[] = [];
let answer: unknown[][] | null = [];
let configured = true;

vi.mock("./posthog", () => ({
  posthogConfigured: () => configured,
  runHogQL: async (query: string, values: Record<string, unknown> = {}) => {
    calls.push({ query, values });
    return answer;
  },
  toNum: (v: unknown) => Number(v ?? 0) || 0,
  toStr: (v: unknown) => (v == null ? "" : String(v)),
}));

const {
  getActivityGrid,
  getBehaviorSummary,
  getBreakdown,
  getDailyVisits,
  getFunnel,
  FUNNELS,
} = await import("./behavior");
const { getHeatPoints, getScrollDepth } = await import("./heatmap-queries");
const { parseHeatmapParams } = await import("./heatmaps");
const { lastDays } = await import("./range");

const window = lastDays(7, "2026-11-12");

beforeEach(() => {
  calls.length = 0;
  answer = [];
  configured = true;
  vi.unstubAllEnvs();
});

describe("HogQL", () => {
  it("never carries the window in the query text, only in bound values", async () => {
    const heat = parseHeatmapParams({ page: "tdee", device: "mobile" });
    await Promise.all([
      getBehaviorSummary(window),
      getDailyVisits(window),
      getFunnel("signup", window),
      getBreakdown("pages", window),
      getActivityGrid(window, "unique"),
      getHeatPoints(heat, window),
      getScrollDepth(heat, window),
    ]);
    expect(calls).toHaveLength(7);
    for (const { query, values } of calls) {
      expect(query).not.toMatch(/2026-/);
      expect(Object.values(values).join(" ")).toMatch(/2026-/);
    }
  });

  it("bounds every instant in UTC and groups days on the operator's clock", async () => {
    await getDailyVisits(window);
    const { query, values } = calls[0];
    expect(query).toContain("toTimeZone(timestamp, 'America/Mexico_City')");
    expect(values).toMatchObject({
      pre_start: "2026-11-05T00:00:00Z",
      pre_end: "2026-11-14T00:00:00Z",
      start_day: "2026-11-06",
      end_day: "2026-11-12",
    });
  });

  it("filters heatmaps on the device's stored width and the page pattern", async () => {
    await getHeatPoints(
      parseHeatmapParams({ page: "tdee", device: "mobile" }),
      window,
    );
    expect(calls[0].values).toMatchObject({
      type: "click",
      vw_min: 0,
      vw_max: 40,
    });
    expect(String(calls[0].values.url_pattern)).toContain("calculadora-tdee");
  });
});

describe("results", () => {
  it("tells 'no answer' from 'nothing yet'", async () => {
    answer = null;
    expect(await getBreakdown("pages", window)).toBeNull();
    answer = [];
    expect(await getBreakdown("pages", window)).toEqual([]);
  });

  it("names every funnel step in order", async () => {
    answer = [[10, 4, 2, 1]];
    expect(await getFunnel("signup", window)).toEqual(
      FUNNELS.signup.steps.map((s, i) => ({
        label: s.label,
        count: [10, 4, 2, 1][i],
      })),
    );
  });

  it("lays the week out Monday first, 24 hours a day", async () => {
    answer = [
      [1, 0, 5],
      [7, 23, 2],
    ];
    const cells = (await getActivityGrid(window))!;
    expect(cells).toHaveLength(7);
    expect(cells[0][0]).toBe(5);
    expect(cells[6][23]).toBe(2);
  });

  it("fills every day of the trend", async () => {
    answer = [["2026-11-10", 3, 9]];
    const daily = (await getDailyVisits(window))!;
    expect(daily.visitors).toHaveLength(7);
    expect(daily.pageviews.find((d) => d.date === "2026-11-10")?.value).toBe(9);
  });
});

describe("simulated mode", () => {
  it("answers from the simulator on a dev server without keys, never asking PostHog", async () => {
    configured = false;
    vi.stubEnv("NODE_ENV", "development");
    const [summary, pages, points] = await Promise.all([
      getBehaviorSummary(window),
      getBreakdown("calculators", window),
      getHeatPoints(parseHeatmapParams({}), window),
    ]);
    expect(calls).toEqual([]);
    expect(summary?.pageviews).toBeGreaterThan(0);
    // Simulated rows go through the live naming: calculator ids become names.
    expect(pages?.some((r) => r.label === "TDEE Calculator")).toBe(true);
    expect(points?.length).toBeGreaterThan(0);
  });

  it("never simulates a deployed build", async () => {
    configured = false;
    vi.stubEnv("NODE_ENV", "production");
    await getBehaviorSummary(window);
    expect(calls).toHaveLength(1);
  });
});
