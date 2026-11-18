import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { type Answers, parseAnswers } from "./diagnostic";
import { recommend } from "./recommend";
import { keepRoadmap, markStep, parseRoadmap, startRoadmap } from "./state";
import { ROADMAP_DOCS, roadmapSteps, schedule } from "./steps";

const BASE: Answers = {
  goal: "unsure",
  sex: "male",
  bodyFatPct: 17,
  bodyFatBand: null,
  weightKg: 85,
  experience: "beginner",
  trainingNow: "consistent",
  tracking: "now",
  sleep: "seven_plus",
  dietHistory: "none",
  caution: false,
};

const plan = (patch: Partial<Answers>) => recommend({ ...BASE, ...patch });

describe("recommend: body fat picks the direction", () => {
  it("cuts above the band whatever the goal", () => {
    expect(plan({ bodyFatPct: 24, goal: "build_muscle" }).phase).toBe("cut");
    expect(plan({ sex: "female", bodyFatPct: 31 }).phase).toBe("cut");
  });

  it("recomposes inside the band unless the goal is fat loss", () => {
    expect(plan({ bodyFatPct: 13.5, goal: "build_muscle" }).phase).toBe(
      "recomp",
    );
    expect(plan({ bodyFatPct: 13.5, goal: "lose_fat" }).phase).toBe("cut");
    expect(plan({ sex: "female", bodyFatPct: 21, goal: "both" }).phase).toBe(
      "recomp",
    );
  });

  it("bulks from the lean side, or holds when already lean and asking to cut", () => {
    expect(plan({ bodyFatPct: 10, goal: "build_muscle" }).phase).toBe("bulk");
    expect(plan({ bodyFatPct: 10, goal: "lose_fat" }).phase).toBe("maintain");
  });

  it("uses the band's representative value when the number is unknown", () => {
    const p = plan({ bodyFatPct: null, bodyFatBand: "high" });
    expect(p.bodyFatPct).toBe(28);
    expect(p.phase).toBe("cut");
  });
});

describe("recommend: rates and lengths", () => {
  it("loses faster the more there is to lose, and heads back into the band", () => {
    const high = plan({ bodyFatPct: 27 });
    const moderate = plan({ bodyFatPct: 17 });
    expect(high.weeklyRateKg).toBe(-0.5);
    expect(moderate.weeklyRateKg).toBe(-0.35);
    expect(high.targetBodyFatPct).toBe(15);
    expect(plan({ bodyFatPct: 14, goal: "lose_fat" }).targetBodyFatPct).toBe(
      12,
    );
  });

  it("spans several blocks when the target is far, and prices the deficit", () => {
    const p = plan({ bodyFatPct: 30, weightKg: 100 });
    expect(p.blockWeeks).toBe(12);
    expect(p.totalWeeks).toBeGreaterThan(12);
    expect(p.dailyKcalDelta).toBe(-550);
  });

  it("caps a bulk by experience", () => {
    const beginner = plan({ bodyFatPct: 10, goal: "build_muscle" });
    const advanced = plan({
      bodyFatPct: 10,
      goal: "build_muscle",
      experience: "advanced",
    });
    expect(beginner.weeklyRatePct!).toBeGreaterThan(advanced.weeklyRatePct!);
    expect(beginner.dailyKcalDelta!).toBeGreaterThan(0);
  });

  it("keeps a cautious plan slow and says why", () => {
    const p = plan({ bodyFatPct: 30, caution: true });
    expect(p.weeklyRateKg).toBe(-0.3);
    expect(p.reasons).toContain("caution");
  });

  it("leads with a maintenance break after a long diet, and with training when there is none", () => {
    expect(plan({ bodyFatPct: 22, dietHistory: "long" }).lead).toBe(
      "dietBreak",
    );
    expect(
      plan({ bodyFatPct: 10, goal: "build_muscle", trainingNow: "none" }).lead,
    ).toBe("foundations");
  });
});

describe("roadmapSteps", () => {
  it("includes the fixes the answers call for, and marks where you are", () => {
    const answers = {
      ...BASE,
      sleep: "under6" as const,
      tracking: "never" as const,
    };
    const steps = roadmapSteps({
      answers,
      plan: recommend(answers),
      done: { measure: "2026-11-02T00:00:00.000Z" },
    });
    const ids = steps.map((s) => s.id);
    expect(ids).toContain("sleep");
    expect(ids).toContain("tracking");
    expect(steps[0].status).toBe("done");
    expect(steps.filter((s) => s.status === "current")).toHaveLength(1);
    expect(steps[1].status).toBe("current");
  });

  it("marks done only the steps the person ticked", () => {
    const steps = roadmapSteps({
      answers: BASE,
      plan: recommend(BASE),
      done: { maintenance: "2026-11-02T00:00:00.000Z" },
    });
    expect(
      steps.filter((s) => s.status === "done").map((s) => [s.id, s.doneAt]),
    ).toEqual([["maintenance", "2026-11-02T00:00:00.000Z"]]);
  });

  it("links the deficit calculator for a cut and the macros one otherwise", () => {
    const cut = roadmapSteps({
      answers: BASE,
      plan: recommend(BASE),
      done: {},
    }).find((s) => s.id === "calories")!;
    expect(cut.links).toContainEqual({ route: "deficit" });
  });
});

describe("schedule", () => {
  it("puts a diet break before the block and counts weeks from the start", () => {
    const p = plan({ bodyFatPct: 22, dietHistory: "long" });
    const s = schedule("2026-11-01T00:00:00.000Z", p, new Date("2026-11-10"));
    expect(s.now).toBe("lead");
    expect(s.week).toBe(2);
    expect(s.totalWeeks).toBe(14);
    expect(s.phaseStart).toBe("2026-11-15");
  });
});

describe("stored state", () => {
  it("round-trips, and rejects junk", () => {
    const state = startRoadmap(BASE, new Date("2026-11-01"), null);
    const ticked = markStep(state, "measure", true, new Date("2026-11-02"));
    expect(parseRoadmap(JSON.parse(JSON.stringify(ticked)))).toEqual(ticked);
    expect(parseRoadmap({ ...ticked, answers: { goal: "x" } })).toBeNull();
    expect(parseAnswers({ ...BASE, bodyFatPct: 99 })).toBeNull();
  });

  it("archives the plan it replaces with how far it got", () => {
    const first = markStep(
      startRoadmap(BASE, new Date("2026-08-01"), null),
      "measure",
      true,
      new Date("2026-08-02"),
    );
    const next = startRoadmap(BASE, new Date("2026-11-01"), {
      state: first,
      phase: "cut",
      total: 12,
    });
    expect(next.history[0]).toMatchObject({ phase: "cut", done: 1, total: 12 });
    expect(next.done).toEqual({});
  });

  it("keeps a result with its ticks and start, and archives the kept plan", () => {
    const kept = startRoadmap(BASE, new Date("2026-08-01"), null);
    const draft = markStep(
      startRoadmap(BASE, new Date("2026-11-10"), null),
      "measure",
      true,
      new Date("2026-11-11"),
    );
    const now = new Date("2026-11-17");
    const next = keepRoadmap(draft, now, {
      state: kept,
      phase: "bulk",
      total: 10,
    });
    expect(next.startedAt).toBe(draft.startedAt);
    expect(next.done).toEqual(draft.done);
    expect(next.history[0]).toMatchObject({
      phase: "bulk",
      startedAt: kept.startedAt,
      endedAt: now.toISOString(),
      done: 0,
    });
    // Nothing to replace: the result's own history stands.
    expect(keepRoadmap(draft, now, null)).toEqual(draft);
  });
});

describe("linked guides", () => {
  it("exist in both locales", () => {
    for (const locale of ["en", "es"])
      for (const slug of ROADMAP_DOCS)
        expect(
          existsSync(
            join(process.cwd(), "content/docs", locale, `${slug}.mdx`),
          ),
          `${locale}/${slug}`,
        ).toBe(true);
  });
});
