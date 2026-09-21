import { describe, expect, it } from "vitest";

import {
  ACTIVITY_METS,
  bmr,
  calorieDeficit,
  caloriesBurned,
  macroTargets,
  proteinTarget,
  tdee,
} from "./energy";
import type { ActivityLevel, Goal, MacroPhase } from "./shared";

// One body, reused so every BMR expectation is comparable across formulas.
const BODY = { weightKg: 80, heightCm: 180, age: 25 };

describe("bmr — Mifflin-St Jeor", () => {
  it("adds the male constant", () => {
    // 10*80 + 6.25*180 - 5*25 + 5 = 1805
    expect(bmr("mifflin", { sex: "male", ...BODY })).toBe(1805);
  });

  it("subtracts the female constant", () => {
    // Same body, 166 kcal apart: the +5 / -161 sex term.
    expect(bmr("mifflin", { sex: "female", ...BODY })).toBe(1639);
  });

  it("ignores body fat", () => {
    expect(bmr("mifflin", { sex: "male", ...BODY, bodyFatPct: 15 })).toBe(
      bmr("mifflin", { sex: "male", ...BODY }),
    );
  });
});

describe("bmr — revised Harris-Benedict", () => {
  it("computes the male equation", () => {
    // 88.362 + 13.397*80 + 4.799*180 - 5.677*25 = 1882.017
    expect(bmr("harris", { sex: "male", ...BODY })).toBe(1882);
  });

  it("computes the female equation", () => {
    // 447.593 + 9.247*80 + 3.098*180 - 4.33*25 = 1636.743
    expect(bmr("harris", { sex: "female", ...BODY })).toBe(1637);
  });
});

describe("bmr — Katch-McArdle", () => {
  it("scales to lean body mass", () => {
    // lbm = 80 * (1 - 0.15) = 68 → 370 + 21.6*68 = 1838.8
    expect(bmr("katch", { sex: "male", ...BODY, bodyFatPct: 15 })).toBe(1839);
  });

  it("treats a missing body fat as zero, so the whole weight is lean", () => {
    // 370 + 21.6*80 = 2098 — the highest the formula can return for 80 kg.
    expect(bmr("katch", { sex: "male", ...BODY })).toBe(2098);
    expect(bmr("katch", { sex: "male", ...BODY, bodyFatPct: 0 })).toBe(2098);
  });

  it("depends on neither sex, height nor age", () => {
    const male = bmr("katch", { sex: "male", ...BODY, bodyFatPct: 20 });
    const female = bmr("katch", {
      sex: "female",
      weightKg: 80,
      heightCm: 150,
      age: 70,
      bodyFatPct: 20,
    });
    expect(female).toBe(male);
  });
});

describe("tdee", () => {
  it.each<[ActivityLevel, number]>([
    ["sedentary", 2166],
    ["light", 2482],
    ["moderate", 2798],
    ["active", 3114],
    ["very_active", 3430],
  ])("multiplies the BMR by the %s factor", (activity, expected) => {
    expect(tdee(1805, activity)).toBe(expected);
  });

  it("rounds to whole calories", () => {
    // 1805 * 1.375 = 2481.875
    expect(Number.isInteger(tdee(1805, "light"))).toBe(true);
  });
});

describe("macroTargets — protein basis", () => {
  it("scales protein to lean mass when body fat is known", () => {
    // 100 kg at 20% BF → 80 kg lean × 2.2 g/kg = 176 g.
    const m = macroTargets({
      kcal: 2500,
      weightKg: 100,
      bodyFatPct: 20,
      phase: "cut",
    });
    expect(m.proteinG).toBe(176);
    expect(m.basis).toBe("lean");
  });

  it("falls back to bodyweight, and reports that it did", () => {
    // Bulk = 1.8 g/kg of bodyweight → 144 g.
    const m = macroTargets({ kcal: 2500, weightKg: 80, phase: "bulk" });
    expect(m.proteinG).toBe(144);
    expect(m.basis).toBe("bodyweight");
  });

  it("treats a null body fat as unknown", () => {
    expect(
      macroTargets({ kcal: 2500, weightKg: 80, bodyFatPct: null, phase: "cut" })
        .basis,
    ).toBe("bodyweight");
  });

  it.each([
    [0, "bodyweight"],
    [0.1, "lean"],
    [59.9, "lean"],
    [60, "bodyweight"],
    [75, "bodyweight"],
  ])("treats %p%% body fat as a %s basis", (bodyFatPct, basis) => {
    expect(
      macroTargets({ kcal: 2500, weightKg: 80, bodyFatPct, phase: "cut" })
        .basis,
    ).toBe(basis);
  });
});

describe("macroTargets — grams per phase", () => {
  it.each<[MacroPhase, number, number]>([
    ["cut", 176, 56],
    ["maintain", 160, 64],
    ["recomp", 160, 64],
    ["bulk", 144, 72],
  ])(
    "gives an 80 kg lifter %s targets of %d g protein and %d g fat",
    (phase, proteinG, fatG) => {
      expect(macroTargets({ kcal: 2500, weightKg: 80, phase })).toMatchObject({
        proteinG,
        fatG,
      });
    },
  );

  it.each<MacroPhase>(["cut", "maintain", "recomp", "bulk"])(
    "keeps %s fat at or above the 0.5 g/kg floor",
    (phase) => {
      expect(
        macroTargets({ kcal: 2000, weightKg: 80, phase }).fatG,
      ).toBeGreaterThanOrEqual(40);
    },
  );
});

describe("macroTargets — carbs as the remainder", () => {
  it("spends whatever energy protein and fat left over on carbs", () => {
    // 2500 - 176*4 - 70*9 = 1166 kcal → 291.5 g → 292 g.
    const m = macroTargets({
      kcal: 2500,
      weightKg: 100,
      bodyFatPct: 20,
      phase: "cut",
    });
    expect(m).toMatchObject({ fatG: 70, carbsG: 292, carbsExhausted: false });
  });

  it("reconciles the rounded macros back to the calorie target", () => {
    const m = macroTargets({
      kcal: 2400,
      weightKg: 75,
      bodyFatPct: 15,
      phase: "maintain",
    });
    expect(m).toMatchObject({ proteinG: 140, fatG: 60, carbsG: 325 });
    const kcal = m.proteinG * 4 + m.carbsG * 4 + m.fatG * 9;
    expect(Math.abs(kcal - 2400)).toBeLessThanOrEqual(4);
  });

  it("clamps carbs at zero instead of going negative", () => {
    // 500 - 220*4 - 70*9 = -1010 kcal: protein and fat alone overshoot.
    expect(
      macroTargets({ kcal: 500, weightKg: 100, phase: "cut" }),
    ).toMatchObject({ carbsG: 0, carbsExhausted: true });
  });

  it("does not call carbs exhausted when the remainder is exactly zero", () => {
    // 220 g protein (880) + 70 g fat (630) = 1510 kcal, to the calorie.
    expect(
      macroTargets({ kcal: 1510, weightKg: 100, phase: "cut" }),
    ).toMatchObject({ carbsG: 0, carbsExhausted: false });
  });

  it("echoes the calorie target it was given", () => {
    expect(macroTargets({ kcal: 2317, weightKg: 80, phase: "cut" }).kcal).toBe(
      2317,
    );
  });
});

describe("calorieDeficit", () => {
  it("plans a cut with duration and daily calories", () => {
    // 5 kg at 0.5 kg/week = 10 weeks; 0.5 * 7700 / 7 = 550 kcal/day.
    expect(calorieDeficit(80, 75, 0.5)).toEqual({
      direction: "lose",
      toChange: 5,
      dailyKcal: 550,
      weeks: 10,
      months: 2.3,
    });
  });

  it("flips direction when the goal weight is higher", () => {
    expect(calorieDeficit(70, 75, 1)).toEqual({
      direction: "gain",
      toChange: 5,
      dailyKcal: 1100,
      weeks: 5,
      months: 1.2,
    });
  });

  it("calls an unchanged weight a loss of nothing", () => {
    expect(calorieDeficit(80, 80, 0.5)).toMatchObject({
      direction: "lose",
      toChange: 0,
      weeks: 0,
      months: 0,
    });
  });

  it.each([0, -1])("falls back to 0.5 kg/week when the rate is %p", (rate) => {
    expect(calorieDeficit(80, 75, rate)).toMatchObject({
      weeks: 10,
      dailyKcal: 550,
    });
  });

  it("derives daily calories from the rate, not from the distance", () => {
    expect(calorieDeficit(80, 75, 1).dailyKcal).toBe(
      calorieDeficit(120, 60, 1).dailyKcal,
    );
  });

  it("rounds weight and duration to one decimal", () => {
    expect(calorieDeficit(80.25, 75, 0.5)).toMatchObject({
      toChange: 5.3,
      weeks: 10.5,
      months: 2.4,
    });
  });
});

describe("proteinTarget", () => {
  it.each<[Goal, number, number, number]>([
    ["cut", 176, 704, 44],
    ["maintain", 160, 640, 40],
    ["bulk", 144, 576, 36],
  ])(
    "gives an 80 kg lifter on a %s %d g, %d kcal and %d g per meal",
    (goal, grams, kcal, perMeal) => {
      expect(proteinTarget(80, goal)).toEqual({ grams, kcal, perMeal });
    },
  );

  it("rounds the per-meal split to whole grams", () => {
    // 2.2 * 75 = 165 g over four meals = 41.25 g.
    expect(proteinTarget(75, "cut")).toEqual({
      grams: 165,
      kcal: 660,
      perMeal: 41,
    });
  });
});

describe("caloriesBurned", () => {
  it("applies the MET formula per minute", () => {
    // (9.8 * 3.5 * 80) / 200 = 13.72 kcal/min → 411.6 over 30 min.
    expect(caloriesBurned(9.8, 80, 30)).toEqual({ total: 412, perHour: 823 });
  });

  it.each<[keyof typeof ACTIVITY_METS, number]>([
    ["walking", 257],
    ["running", 720],
    ["cycling", 551],
    ["swimming", 610],
    ["weightlifting", 441],
    ["hiit", 588],
    ["yoga", 206],
    ["soccer", 515],
  ])("burns %s for an hour at 70 kg", (activity, total) => {
    const burned = caloriesBurned(ACTIVITY_METS[activity], 70, 60);
    expect(burned).toEqual({ total, perHour: total });
  });

  it("burns nothing in zero minutes, yet still reports the hourly rate", () => {
    expect(caloriesBurned(9.8, 80, 0)).toEqual({ total: 0, perHour: 823 });
  });

  it("scales with minutes, up to the whole-calorie rounding", () => {
    // 11.8125 kcal/min: 354.375 rounds down per half, 708.75 rounds up whole —
    // two halves are not guaranteed to add up to the hour.
    const half = caloriesBurned(7.5, 90, 30).total;
    const full = caloriesBurned(7.5, 90, 60).total;
    expect(half).toBe(354);
    expect(full).toBe(709);
    expect(Math.abs(full - half * 2)).toBeLessThanOrEqual(1);
  });

  it("scales with bodyweight", () => {
    expect(caloriesBurned(6, 100, 60).total).toBeGreaterThan(
      caloriesBurned(6, 80, 60).total,
    );
  });
});
