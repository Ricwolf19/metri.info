import { describe, expect, it } from "vitest";

import { buildCalcFacts, type LogFacts, type ProfileFacts } from "./facts";
import { applyFactsToValues, PREFILL } from "./prefill";
import { CALCULATORS } from "./registry";
import { readValues } from "./share";
import { type CalcValues, fieldInUse } from "./types";

const NOW = new Date("2026-11-16T12:00:00Z");

const NO_LOGS: LogFacts = {
  weightKg: null,
  bodyFatPct: null,
  tape: {},
  goal: null,
};

const PROFILE: ProfileFacts = {
  sex: "female",
  age: 34,
  bodyWeightKg: 70,
  bodyHeightCm: 165,
  bodyFatPct: 26,
  activityLevel: "moderate",
  bmrFormula: "katch_mcardle",
  latestTdee: null,
  unitsPreference: "kg",
};

const defaults = (id: keyof typeof CALCULATORS): CalcValues =>
  readValues(CALCULATORS[id], () => null);

describe("buildCalcFacts", () => {
  it("prefers a synced reading over the profile, and the profile over a saved calc", () => {
    const facts = buildCalcFacts({
      profile: PROFILE,
      logs: { ...NO_LOGS, weightKg: 68.4, tape: { waist: 74 } },
      saved: [
        {
          calculatorType: "whtr",
          inputs: { waist: 80, height: 170 },
          createdAt: new Date("2026-10-01"),
        },
      ],
      now: NOW,
    });
    expect(facts.weightKg).toBe(68.4);
    expect(facts.heightCm).toBe(165);
    expect(facts.waistCm).toBe(74);
    expect(facts.bmrFormula).toBe("katch");
  });

  it("falls back to saved calculations and ages a saved age forward", () => {
    const facts = buildCalcFacts({
      profile: null,
      logs: NO_LOGS,
      saved: [
        {
          calculatorType: "heartrate",
          inputs: { age: 30, resting: 58 },
          createdAt: new Date("2024-06-01"),
        },
        {
          calculatorType: "heartrate",
          inputs: { age: 25, resting: 70 },
          createdAt: new Date("2019-01-01"),
        },
      ],
      now: NOW,
    });
    expect(facts.age).toBe(32);
    expect(facts.restingHr).toBe(58);
  });

  it("turns an active cut into a deficit target and goal", () => {
    const facts = buildCalcFacts({
      profile: PROFILE,
      logs: {
        ...NO_LOGS,
        goal: {
          phase: "cut",
          startWeightKg: 80,
          rateKgPerWeek: -0.5,
          durationWeeks: 12,
          tdeeAtStart: 2400,
        },
      },
      saved: [],
      now: NOW,
    });
    expect(facts.goal).toBe("cut");
    expect(facts.targetWeightKg).toBe(74);
    expect(facts.rateKgPerWeek).toBe(0.5);
    expect(facts.maintenanceKcal).toBe(2400);
  });

  it("estimates maintenance from complete facts when nothing stored it", () => {
    const facts = buildCalcFacts({
      profile: { ...PROFILE, bmrFormula: null },
      logs: NO_LOGS,
      saved: [],
      now: NOW,
    });
    expect(facts.maintenanceKcal).toBeGreaterThan(1800);
    expect(facts.maintenanceKcal).toBeLessThan(2600);
  });
});

describe("buildCalcFacts with untrusted saves", () => {
  it("drops values outside the known sets and never estimates from them", () => {
    const facts = buildCalcFacts({
      profile: null,
      logs: NO_LOGS,
      saved: [
        {
          calculatorType: "tdee",
          inputs: {
            sex: "robot",
            age: 30,
            height: 180,
            weight: 80,
            activity: "hyper",
            formula: "magic",
          },
          createdAt: new Date("2026-11-01"),
        },
        {
          calculatorType: "macros",
          inputs: { goal: "shred", calories: 99_999 },
          createdAt: new Date("2026-11-02"),
        },
      ],
      now: NOW,
    });
    expect(facts.sex).toBeNull();
    expect(facts.activity).toBeNull();
    expect(facts.bmrFormula).toBeNull();
    expect(facts.goal).toBeNull();
    expect(facts.maintenanceKcal).toBeNull();
  });
});

describe("applyFactsToValues", () => {
  const facts = buildCalcFacts({
    profile: PROFILE,
    logs: { ...NO_LOGS, bodyFatPct: 24.37, tape: { hips: 98.26 } },
    saved: [],
    now: NOW,
  });

  it("fills age, body fat and the formula in TDEE", () => {
    const { values, changed } = applyFactsToValues(
      CALCULATORS.tdee,
      defaults("tdee"),
      facts,
    );
    expect(changed).toBe(true);
    expect(values).toMatchObject({
      sex: "female",
      age: 34,
      bodyFat: 24.5,
      formula: "katch",
    });
  });

  it("snaps to the field's step without float dust", () => {
    const { values } = applyFactsToValues(
      CALCULATORS.bodyfat,
      defaults("bodyfat"),
      facts,
    );
    expect(values.hip).toBe(98.3);
  });

  it("skips a fact the field can't take", () => {
    const { values } = applyFactsToValues(
      CALCULATORS.heartrate,
      defaults("heartrate"),
      { ...facts, age: 7 },
    );
    expect(values.age).toBe(defaults("heartrate").age);
  });

  it("only maps fields that exist on each calculator", () => {
    for (const [id, map] of Object.entries(PREFILL)) {
      const names = CALCULATORS[id as keyof typeof CALCULATORS].fields.map(
        (f) => f.name,
      );
      for (const field of Object.keys(map)) expect(names).toContain(field);
    }
  });
});

describe("fieldInUse", () => {
  it("disables body fat in TDEE unless the formula is Katch-McArdle", () => {
    const bodyFat = CALCULATORS.tdee.fields.find((f) => f.name === "bodyFat")!;
    const age = CALCULATORS.tdee.fields.find((f) => f.name === "age")!;
    expect(fieldInUse(bodyFat, { formula: "mifflin" })).toBe(false);
    expect(fieldInUse(bodyFat, { formula: "katch" })).toBe(true);
    expect(fieldInUse(age, { formula: "katch" })).toBe(false);
    expect(fieldInUse(age, { formula: "harris" })).toBe(true);
  });

  it("only uses hip circumference in the women's Navy formula", () => {
    const hip = CALCULATORS.bodyfat.fields.find((f) => f.name === "hip")!;
    expect(fieldInUse(hip, { sex: "male" })).toBe(false);
    expect(fieldInUse(hip, { sex: "female" })).toBe(true);
  });

  it("only gates on a select that exists in the same calculator", () => {
    for (const config of Object.values(CALCULATORS))
      for (const f of config.fields)
        if (f.usedWhen)
          expect(
            config.fields.some(
              (g) => g.name === f.usedWhen!.field && g.kind === "select",
            ),
          ).toBe(true);
  });
});
