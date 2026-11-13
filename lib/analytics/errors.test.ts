import { describe, expect, it } from "vitest";

import {
  parseDiscover,
  parseIssues,
  sentryPeriod,
  statsSeries,
  statsTotal,
} from "./errors";
import { lastDays, parseRange } from "./range";

const TODAY = "2026-11-12";

describe("sentryPeriod", () => {
  it("asks relative to Sentry's now when the window runs to today", () => {
    expect(sentryPeriod(lastDays(30, TODAY), TODAY).query).toBe(
      "statsPeriod=30d",
    );
  });

  it("asks for explicit bounds for a past window, end exclusive", () => {
    const w = parseRange({ from: "2026-10-01", to: "2026-10-31" }, TODAY);
    expect(sentryPeriod(w, TODAY).query).toBe(
      "start=2026-10-01T00:00:00&end=2026-11-01T00:00:00",
    );
  });

  it("reads 90 days at most", () => {
    const p = sentryPeriod(lastDays(365, TODAY), TODAY);
    expect(p).toMatchObject({ clamped: true, query: "statsPeriod=90d" });
  });
});

describe("parsing", () => {
  const stats = {
    intervals: ["2026-11-10T00:00:00Z", "2026-11-11T00:00:00Z"],
    groups: [
      { totals: { "sum(quantity)": 5 }, series: { "sum(quantity)": [2, 3] } },
      { totals: { "sum(quantity)": 1 }, series: { "sum(quantity)": [1, 0] } },
    ],
  };

  it("sums stats_v2 totals and series across groups", () => {
    expect(statsTotal(stats)).toBe(6);
    expect([...statsSeries(stats)]).toEqual([
      ["2026-11-10", 3],
      ["2026-11-11", 3],
    ]);
  });

  it("keeps only https permalinks", () => {
    const [ok, bad] = parseIssues([
      {
        id: "1",
        permalink: "https://metri-ku.sentry.io/issues/1/",
        count: "4",
        userCount: 2,
      },
      { id: "2", permalink: "javascript:alert(1)" },
    ])!;
    expect(ok).toMatchObject({
      count: 4,
      users: 2,
      permalink: "https://metri-ku.sentry.io/issues/1/",
    });
    expect(bad.permalink).toBeNull();
    expect(parseIssues({ detail: "nope" })).toBeNull();
  });

  it("shortens a commit-SHA release", () => {
    expect(
      parseDiscover(
        {
          data: [
            {
              release: "0f49d04aa11bb22cc33dd44ee55ff66778899aab",
              "count()": 3,
            },
          ],
        },
        "release",
      ),
    ).toEqual([{ label: "0f49d04", value: 3 }]);
  });
});
