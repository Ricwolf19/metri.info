import { describe, expect, it } from "vitest";

import {
  depthReachedBy,
  heatPalette,
  intensityCap,
  pointIntensity,
  pointStats,
  scrolledPast,
  scrollReachBands,
} from "./heat";
import {
  HEATMAP_DEVICES,
  HEATMAP_PAGES,
  heatmapUrlPattern,
  parseHeatmapParams,
} from "./heatmaps";

const page = (id: string) => HEATMAP_PAGES.find((p) => p.id === id)!;
const matches = (id: string, url: string) =>
  new RegExp(heatmapUrlPattern(page(id), "metri.info")).test(url);

describe("page patterns", () => {
  it("match a page in both languages, with or without a slash or query", () => {
    expect(matches("home", "https://metri.info/")).toBe(true);
    expect(matches("home", "https://metri.info")).toBe(true);
    expect(matches("home", "https://www.metri.info/es?utm=x")).toBe(true);
    expect(matches("tdee", "https://metri.info/tools/tdee-calculator")).toBe(
      true,
    );
    expect(
      matches("tdee", "https://metri.info/es/herramientas/calculadora-tdee/#r"),
    ).toBe(true);
  });

  it("match nothing else: no deeper path, no other host", () => {
    expect(matches("home", "https://metri.info/tools")).toBe(false);
    expect(matches("tools", "https://metri.info/tools/tdee-calculator")).toBe(
      false,
    );
    expect(matches("home", "https://metri.info.evil.com/")).toBe(false);
    expect(matches("home", "http://localhost:3000/")).toBe(false);
  });

  it("match every guide, not the guides index", () => {
    expect(matches("guide", "https://metri.info/docs/protein-intake")).toBe(
      true,
    );
    expect(
      matches("guide", "https://metri.info/es/docs/ingesta-proteina"),
    ).toBe(true);
    expect(matches("guide", "https://metri.info/docs")).toBe(false);
  });
});

describe("devices", () => {
  it("cover every stored viewport width exactly once", () => {
    for (let scaled = 0; scaled <= 200; scaled++) {
      const owners = HEATMAP_DEVICES.filter(
        (d) =>
          scaled >= d.minScaled &&
          (d.maxScaled === null || scaled <= d.maxScaled),
      );
      expect(owners).toHaveLength(1);
    }
  });
});

describe("parseHeatmapParams", () => {
  it("falls back to defaults on anything unknown", () => {
    const p = parseHeatmapParams({
      page: "nope",
      device: "watch",
      map: "x",
      count: "y",
    });
    expect([p.page.id, p.device.id, p.map.id, p.agg]).toEqual([
      "home",
      "desktop",
      "click",
      "total",
    ]);
  });

  it("reads known values", () => {
    const p = parseHeatmapParams({
      page: "quiz",
      device: "mobile",
      map: "scrolldepth",
      count: "unique",
    });
    expect([p.page.id, p.device.id, p.map.id, p.agg]).toEqual([
      "quiz",
      "mobile",
      "scrolldepth",
      "unique",
    ]);
  });
});

describe("point math", () => {
  it("caps intensity at the 95th percentile so one hot spot can't wash out the rest", () => {
    const points = [
      ...Array.from({ length: 99 }, () => ({ count: 2 })),
      { count: 500 },
    ];
    expect(intensityCap(points)).toBe(2);
    expect(pointIntensity(500, 2)).toBe(1);
    expect(pointIntensity(0.01, 2)).toBe(0.08);
  });

  it("counts fixed interactions and spots", () => {
    expect(
      pointStats([
        { x: 0.5, y: 10, fixed: true, count: 3 },
        { x: 0.2, y: 900, fixed: false, count: 1 },
      ]),
    ).toEqual({ total: 4, hottest: 3, fixedShare: 0.75, spots: 2 });
  });

  it("is transparent at no heat and mostly opaque at the top", () => {
    const palette = heatPalette();
    expect(palette[3]).toBe(0);
    expect(palette[255 * 4 + 3]).toBeGreaterThan(200);
  });
});

describe("scroll depth", () => {
  const bands = scrollReachBands([
    { bucket: 800, count: 2 },
    { bucket: 1600, count: 1 },
    { bucket: 2400, count: 1 },
  ]);

  it("starts at 100% and only falls", () => {
    expect(bands[0].reach).toBe(1);
    for (let i = 1; i < bands.length; i++)
      expect(bands[i].reach).toBeLessThanOrEqual(bands[i - 1].reach);
  });

  it("reads how deep a share of visits got", () => {
    expect(depthReachedBy(bands, 1)).toBe(900);
    expect(depthReachedBy(bands, 0.5)).toBe(1700);
    expect(depthReachedBy(bands, 0.25)).toBe(2500);
  });

  it("doesn't count a visit that never scrolled as past the first screen", () => {
    const buckets = [
      { bucket: 800, count: 3 },
      { bucket: 1600, count: 1 },
    ];
    expect(scrolledPast(buckets, 800)).toBe(0.25);
    expect(scrolledPast([], 800)).toBe(0);
  });

  it("is empty with no visits", () => {
    expect(scrollReachBands([])).toEqual([]);
  });
});
