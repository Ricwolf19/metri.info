import { describe, expect, it } from "vitest";

import { lastDays } from "./range";
import {
  canonicalMismatch,
  coverageGroups,
  parseInspection,
  parseSearchRows,
  parseSitemaps,
  type SearchRow,
  searchWindow,
  sitemapStatus,
  strikingDistance,
  underperforming,
} from "./search";

const TODAY = "2026-11-12";

const row = (over: Partial<SearchRow>): SearchRow => ({
  keys: ["q"],
  clicks: 0,
  impressions: 100,
  ctr: 0,
  position: 5,
  ...over,
});

describe("searchWindow", () => {
  it("slides back to the last final day, keeping the length", () => {
    const { window, shifted } = searchWindow(lastDays(7, TODAY), TODAY);
    expect(shifted).toBe(true);
    expect(window).toMatchObject({
      startDate: "2026-11-03",
      endDate: "2026-11-09",
      days: 7,
    });
  });

  it("leaves a window that already ended alone", () => {
    expect(searchWindow(lastDays(7, "2026-11-01"), TODAY).shifted).toBe(false);
  });
});

describe("parsing", () => {
  it("treats a missing rows key as no rows, not a failure", () => {
    expect(parseSearchRows({ responseAggregationType: "byProperty" })).toEqual(
      [],
    );
  });

  it("reads sitemaps, int64 strings included", () => {
    const [s] = parseSitemaps({
      sitemap: [
        {
          path: "https://metri.info/sitemap.xml",
          isPending: false,
          errors: "0",
          warnings: "1",
          lastDownloaded: "2026-11-10T08:00:00Z",
          contents: [{ type: "web", submitted: "94" }],
        },
      ],
    });
    expect(s).toMatchObject({ submitted: 94, warnings: 1, errors: 0 });
    expect(sitemapStatus(s)).toBe("warnings");
  });

  it("reads an inspection, or nothing without an index status", () => {
    const i = parseInspection("https://metri.info/tools", {
      inspectionResult: {
        indexStatusResult: {
          verdict: "NEUTRAL",
          coverageState: "Discovered - currently not indexed",
          googleCanonical: "https://metri.info/es/herramientas",
          userCanonical: "https://metri.info/tools",
        },
      },
    });
    expect(i).toMatchObject({ verdict: "NEUTRAL", lastCrawl: null });
    expect(canonicalMismatch(i!)).toBe(true);
    expect(parseInspection("https://metri.info/", {})).toBeNull();
  });
});

describe("opportunities", () => {
  it("flags page-one queries under half the usual click-through", () => {
    const rows = [
      row({
        keys: ["tdee"],
        position: 4,
        clicks: 1,
        ctr: 0.01,
        impressions: 200,
      }),
      row({
        keys: ["fine"],
        position: 4,
        clicks: 20,
        ctr: 0.1,
        impressions: 200,
      }),
      row({ keys: ["rare"], position: 4, impressions: 5 }),
      row({ keys: ["deep"], position: 30 }),
    ];
    const out = underperforming(rows);
    expect(out.map((r) => r.keys[0])).toEqual(["tdee"]);
    expect(out[0].gain).toBe(11);
  });

  it("finds queries ranking 8 to 20, most impressions first", () => {
    const rows = [
      row({ keys: ["a"], position: 12, impressions: 40 }),
      row({ keys: ["b"], position: 9, impressions: 80 }),
      row({ keys: ["c"], position: 3, impressions: 500 }),
      row({ keys: ["d"], position: 25, impressions: 500 }),
    ];
    expect(strikingDistance(rows).map((r) => r.keys[0])).toEqual(["b", "a"]);
  });
});

describe("coverageGroups", () => {
  it("groups URLs by coverage state, biggest first", () => {
    const at = (url: string, coverage: string, verdict = "NEUTRAL") =>
      parseInspection(url, {
        inspectionResult: {
          indexStatusResult: { verdict, coverageState: coverage },
        },
      })!;
    const groups = coverageGroups([
      at("https://metri.info/a", "Discovered - currently not indexed"),
      at("https://metri.info/b", "Submitted and indexed", "PASS"),
      at("https://metri.info/c", "Discovered - currently not indexed"),
    ]);
    expect(groups.map((g) => [g.coverage, g.urls.length, g.indexed])).toEqual([
      ["Discovered - currently not indexed", 2, false],
      ["Submitted and indexed", 1, true],
    ]);
  });
});
