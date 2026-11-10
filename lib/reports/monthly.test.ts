import { describe, expect, it } from "vitest";

import { demoReportInput } from "./fixtures";
import {
  buildMonthlyReport,
  daysInPeriod,
  dropImplausibleWeighIns,
  hasEnoughData,
  previousPeriod,
  type ReportInput,
  reportPeriodFor,
} from "./monthly";

const PERIOD = "2026-10";
const PREVIOUS = "2026-09";

const inMonth = (date: string, period = PERIOD) => date.startsWith(period);

const anomalyIds = (input: ReportInput) =>
  buildMonthlyReport(input).anomalies.map((a) => a.id);

/** A flat, unremarkable weigh-in month, so body rules stay quiet. */
const flatWeighIns = (kg = 80) =>
  Array.from({ length: 28 }, (_, i) => ({
    date: `${PERIOD}-${String(i + 1).padStart(2, "0")}`,
    weightKg: kg,
  }));

const empty: ReportInput = {
  ...demoReportInput(PERIOD),
  sessions: [],
  sets: [],
  skippedDays: [],
  weighIns: [],
  tape: [],
  food: [],
  goal: null,
};

describe("periods", () => {
  it("reports on the month that just ended, across a year boundary", () => {
    expect(reportPeriodFor(new Date("2026-11-02T15:00:00Z"))).toBe("2026-10");
    expect(reportPeriodFor(new Date("2027-01-02T15:00:00Z"))).toBe("2026-12");
  });

  it("walks back whole months", () => {
    expect(previousPeriod("2026-01")).toBe("2025-12");
    expect(previousPeriod("2026-03", 3)).toBe("2025-12");
  });

  it("knows month lengths, leap years included", () => {
    expect(daysInPeriod("2026-10")).toBe(31);
    expect(daysInPeriod("2028-02")).toBe(29);
  });
});

describe("hasEnoughData", () => {
  it("is false for an empty month, so it gets the tips edition", () => {
    expect(hasEnoughData(buildMonthlyReport(empty))).toBe(false);
  });

  it("accepts any one solid kind of tracking", () => {
    const demo = demoReportInput(PERIOD);
    expect(
      hasEnoughData(
        buildMonthlyReport({ ...empty, sessions: demo.sessions.slice(-4) }),
      ),
    ).toBe(true);
    expect(
      hasEnoughData(buildMonthlyReport({ ...empty, weighIns: flatWeighIns() })),
    ).toBe(true);
    expect(
      hasEnoughData(
        buildMonthlyReport({
          ...empty,
          food: Array.from({ length: 14 }, (_, i) => ({
            date: `${PERIOD}-${String(i + 1).padStart(2, "0")}`,
            kcal: 2000,
            proteinG: 150,
          })),
        }),
      ),
    ).toBe(true);
  });

  it("rejects a month with only a little of everything", () => {
    const demo = demoReportInput(PERIOD);
    const thin = buildMonthlyReport({
      ...empty,
      sessions: demo.sessions.filter((s) => inMonth(s.date)).slice(0, 3),
      weighIns: flatWeighIns().slice(0, 3),
    });
    expect(hasEnoughData(thin)).toBe(false);
  });
});

describe("the verdict", () => {
  it("calls a month of more work and rising lifts strong", () => {
    const report = buildMonthlyReport(demoReportInput(PERIOD));
    expect(report.verdict).toBe("strong");
    expect(report.anomalies).toEqual([]);
    expect(report.nextStep).toBe("keep_progressing");
    expect(report.strength.gains).toHaveLength(3);
    const pcts = report.strength.gains.map((g) => g.pct);
    expect(pcts).toEqual([...pcts].sort((a, b) => b - a));
  });

  it("marks a first month, with nothing to compare against", () => {
    const demo = demoReportInput(PERIOD);
    const report = buildMonthlyReport({
      ...demo,
      sessions: demo.sessions.filter((s) => inMonth(s.date)),
      sets: demo.sets.filter((s) => inMonth(s.date)),
    });
    expect(report.verdict).toBe("first");
    expect(report.training.prevSessions).toBeNull();
    expect(report.strength.gains).toEqual([]);
  });

  it("marks a clearly lighter month", () => {
    const demo = demoReportInput(PERIOD);
    const kept = demo.sessions
      .filter((s) => inMonth(s.date))
      .slice(0, 4)
      .map((s) => s.date);
    const report = buildMonthlyReport({
      ...demo,
      sessions: demo.sessions.filter(
        (s) => !inMonth(s.date) || kept.includes(s.date),
      ),
      sets: demo.sets.filter((s) => !inMonth(s.date) || kept.includes(s.date)),
    });
    expect(report.verdict).toBe("down");
  });

  it("still says something for a month of weigh-ins alone", () => {
    const report = buildMonthlyReport({ ...empty, weighIns: flatWeighIns() });
    expect(report.verdict).toBe("tracking");
  });
});

describe("observations", () => {
  it("flags weight falling faster than the phase calls for", () => {
    const report = buildMonthlyReport({
      ...demoReportInput(PERIOD),
      weighIns: Array.from({ length: 28 }, (_, i) => ({
        date: `${PERIOD}-${String(i + 1).padStart(2, "0")}`,
        weightKg: 90 - i * 0.2,
      })),
    });
    expect(report.anomalies[0]).toMatchObject({
      id: "weight_fast",
      direction: "down",
    });
    expect(report.nextStep).toBe("adjust_phase");
  });

  it("holds a bulk to a tighter limit than no goal at all", () => {
    const climbing = Array.from({ length: 28 }, (_, i) => ({
      date: `${PERIOD}-${String(i + 1).padStart(2, "0")}`,
      weightKg: 80 + i * 0.08,
    }));
    const demo = demoReportInput(PERIOD);
    expect(
      anomalyIds({
        ...demo,
        weighIns: climbing,
        goal: { phase: "bulk", targetKcal: null, proteinG: null },
      }),
    ).toContain("weight_fast");
    expect(
      anomalyIds({ ...demo, weighIns: climbing, goal: null }),
    ).not.toContain("weight_fast");
  });

  it("flags a long stretch without training", () => {
    const demo = demoReportInput(PERIOD);
    const removed = new Set([`${PERIOD}-11`, `${PERIOD}-14`, `${PERIOD}-17`]);
    const report = buildMonthlyReport({
      ...demo,
      sessions: demo.sessions.filter((s) => !removed.has(s.date)),
      sets: demo.sets.filter((s) => !removed.has(s.date)),
    });
    expect(report.anomalies).toContainEqual({ id: "training_gap", days: 12 });
    expect(report.nextStep).toBe("plan_days");
  });

  it("opens no gap before someone's first ever session", () => {
    const report = buildMonthlyReport({
      ...demoReportInput(PERIOD),
      sessions: [{ id: "a", date: `${PERIOD}-25`, durationSeconds: null }],
      sets: [],
    });
    expect(report.training.longestGapDays).toBe(6);
  });

  it("flags a dip on a main lift, not a one-off exercise", () => {
    const demo = demoReportInput(PERIOD);
    const report = buildMonthlyReport({
      ...demo,
      sets: demo.sets.map((s) =>
        inMonth(s.date) && s.exerciseId === "barbell-back-squat"
          ? { ...s, weightKg: s.weightKg * 0.85 }
          : s,
      ),
    });
    expect(report.anomalies).toContainEqual(
      expect.objectContaining({
        id: "strength_drop",
        exerciseId: "barbell-back-squat",
      }),
    );
    expect(report.verdict).toBe("steady");
  });

  it("ignores an impossible jump as a typo", () => {
    const demo = demoReportInput(PERIOD);
    const report = buildMonthlyReport({
      ...demo,
      sets: demo.sets.map((s) =>
        inMonth(s.date) && s.exerciseId === "lat-pulldown"
          ? { ...s, weightKg: s.weightKg * 10 }
          : s,
      ),
    });
    expect(report.strength.gains.map((g) => g.exerciseId)).not.toContain(
      "lat-pulldown",
    );
  });

  it("flags a sudden jump in volume", () => {
    const demo = demoReportInput(PERIOD);
    const extra = demo.sets
      .filter((s) => inMonth(s.date))
      .map((s) => ({ ...s, at: s.at + 1 }));
    expect(anomalyIds({ ...demo, sets: [...demo.sets, ...extra] })).toContain(
      "volume_spike",
    );
  });

  it("flags a muscle that lost its work while the rest held up", () => {
    const demo = demoReportInput(PERIOD);
    const report = buildMonthlyReport({
      ...demo,
      sets: demo.sets.map((s) =>
        inMonth(s.date) && s.exerciseId === "barbell-back-squat"
          ? { ...s, exerciseId: "barbell-bench-press" }
          : s,
      ),
    });
    expect(report.anomalies).toContainEqual(
      expect.objectContaining({ id: "muscle_drop", head: "quads" }),
    );
  });

  it("orders them by importance", () => {
    const demo = demoReportInput(PERIOD);
    const removed = new Set([`${PERIOD}-11`, `${PERIOD}-14`, `${PERIOD}-17`]);
    const ids = anomalyIds({
      ...demo,
      sessions: demo.sessions.filter((s) => !removed.has(s.date)),
      weighIns: Array.from({ length: 28 }, (_, i) => ({
        date: `${PERIOD}-${String(i + 1).padStart(2, "0")}`,
        weightKg: 90 - i * 0.2,
      })),
    });
    expect(ids.slice(0, 2)).toEqual(["weight_fast", "training_gap"]);
  });
});

describe("weigh-ins", () => {
  it("drops a typo but keeps a real change that sticks", () => {
    const { kept, dropped } = dropImplausibleWeighIns([
      { date: `${PERIOD}-01`, weightKg: 80 },
      { date: `${PERIOD}-02`, weightKg: 80.2 },
      { date: `${PERIOD}-03`, weightKg: 89 },
      { date: `${PERIOD}-04`, weightKg: 80.1 },
      { date: `${PERIOD}-05`, weightKg: 80 },
    ]);
    expect(dropped.map((w) => w.date)).toEqual([`${PERIOD}-03`]);
    expect(kept).toHaveLength(4);
  });

  it("counts what it left out in the report", () => {
    const weighIns = flatWeighIns();
    weighIns[10] = { ...weighIns[10], weightKg: 95 };
    const report = buildMonthlyReport({ ...empty, weighIns });
    expect(report.body?.excludedWeighIns).toBe(1);
    expect(report.body?.deltaKg).toBe(0);
  });
});

describe("nutrition", () => {
  it("withholds averages when under half the month was logged", () => {
    const report = buildMonthlyReport({
      ...demoReportInput(PERIOD),
      food: Array.from({ length: 10 }, (_, i) => ({
        date: `${PERIOD}-${String(i + 1).padStart(2, "0")}`,
        kcal: 1000,
        proteinG: 50,
      })),
    });
    expect(report.nutrition).toMatchObject({
      daysLogged: 10,
      reliable: false,
      avgKcal: null,
      avgProteinG: null,
    });
    expect(report.nextStep).toBe("log_food");
  });
});

describe("month boundaries", () => {
  it("places sessions by the local day they counted for", () => {
    const demo = demoReportInput(PERIOD);
    const report = buildMonthlyReport({
      ...demo,
      sessions: [
        ...demo.sessions,
        { id: "late", date: `${PREVIOUS}-30`, durationSeconds: 60 },
      ],
    });
    expect(report.training.sessions).toBe(9);
    expect(report.training.prevSessions).toBe(10);
  });
});
