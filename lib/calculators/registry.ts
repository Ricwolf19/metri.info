import {
  type ActivityLevel,
  type BmrFormula,
  type Goal,
  type OneRmFormula,
  type Sex,
  RM_PERCENTAGES,
  bmi,
  bmiCategory,
  bmr,
  bodyFatCategory,
  bodyFatNavy,
  ffmi,
  ffmiBand,
  healthyWeightRange,
  hydration,
  macros,
  oneRm,
  plateLoad,
  tdee,
} from "@/lib/calculations";
import type { TranslationKey } from "@/lib/i18n/en";
import type { CalcConfig, CalcId, CalcValues, SelectOption } from "./types";

const fmt = (n: number) => n.toLocaleString("en-US");
const num = (v: CalcValues, k: string) => Number(v[k]) || 0;
const str = (v: CalcValues, k: string) => String(v[k] ?? "");

const SEX_OPTIONS: SelectOption[] = [
  { value: "male", labelKey: "calc.male" },
  { value: "female", labelKey: "calc.female" },
];

const ACTIVITY_OPTIONS: SelectOption[] = [
  { value: "sedentary", labelKey: "activity.sedentary" },
  { value: "light", labelKey: "activity.light" },
  { value: "moderate", labelKey: "activity.moderate" },
  { value: "active", labelKey: "activity.active" },
  { value: "very_active", labelKey: "activity.veryActive" },
];

const GOAL_OPTIONS: SelectOption[] = [
  { value: "cut", labelKey: "calc.goal.cut" },
  { value: "maintain", labelKey: "calc.goal.maintain" },
  { value: "bulk", labelKey: "calc.goal.bulk" },
];

const BMI_NOTE: Record<string, TranslationKey> = {
  underweight: "calc.bmi.underweight",
  normal: "calc.bmi.normal",
  overweight: "calc.bmi.overweight",
  obese: "calc.bmi.obese",
};

const BF_NOTE: Record<string, TranslationKey> = {
  essential: "calc.bf.essential",
  athlete: "calc.bf.athlete",
  fitness: "calc.bf.fitness",
  average: "calc.bf.average",
  high: "calc.bf.high",
};

const FFMI_NOTE: Record<string, TranslationKey> = {
  below: "calc.ffmi.below",
  average: "calc.ffmi.average",
  aboveAverage: "calc.ffmi.aboveAverage",
  excellent: "calc.ffmi.excellent",
  superior: "calc.ffmi.superior",
  suspicious: "calc.ffmi.suspicious",
};

const C = {
  blue: "#38bdf8",
  green: "#22c55e",
  lime: "#84cc16",
  yellow: "#eab308",
  orange: "#f97316",
  amber: "#f59e0b",
  red: "#ef4444",
  violet: "#8b5cf6",
};

export const CALCULATORS: Record<CalcId, CalcConfig> = {
  onerm: {
    id: "onerm",
    fields: [
      {
        name: "weight",
        kind: "number",
        labelKey: "calc.weight",
        unit: "kg",
        min: 1,
        max: 500,
        step: 0.5,
        default: 100,
      },
      {
        name: "reps",
        kind: "number",
        labelKey: "calc.reps",
        min: 1,
        max: 20,
        step: 1,
        default: 5,
      },
      {
        name: "formula",
        kind: "select",
        labelKey: "calc.formula",
        default: "epley",
        options: [
          { value: "epley", labelKey: "calc.formula.epley" },
          { value: "brzycki", labelKey: "calc.formula.brzycki" },
        ],
      },
    ],
    compute: (v) => {
      const w = num(v, "weight");
      const reps = num(v, "reps");
      const max = oneRm(w, reps, str(v, "formula") as OneRmFormula);
      if (max <= 0) return null;
      return {
        primaryLabelKey: "calc.result.oneRm",
        primaryValue: fmt(max),
        primaryUnit: "kg",
        rows: RM_PERCENTAGES.filter((p) => p.pct < 100).map((p) => ({
          label: `${p.pct}% · ${p.reps}`,
          value: `${fmt(Math.round(((max * p.pct) / 100) * 10) / 10)} kg`,
        })),
      };
    },
  },

  tdee: {
    id: "tdee",
    fields: [
      {
        name: "sex",
        kind: "select",
        labelKey: "calc.sex",
        default: "male",
        options: SEX_OPTIONS,
      },
      {
        name: "age",
        kind: "number",
        labelKey: "calc.age",
        min: 10,
        max: 120,
        step: 1,
        default: 30,
      },
      {
        name: "height",
        kind: "number",
        labelKey: "calc.height",
        unit: "cm",
        min: 90,
        max: 250,
        step: 1,
        default: 180,
      },
      {
        name: "weight",
        kind: "number",
        labelKey: "calc.weight",
        unit: "kg",
        min: 25,
        max: 350,
        step: 0.5,
        default: 80,
      },
      {
        name: "bodyFat",
        kind: "number",
        labelKey: "calc.bodyFat",
        unit: "%",
        min: 0,
        max: 70,
        step: 0.5,
        default: 18,
      },
      {
        name: "activity",
        kind: "select",
        labelKey: "calc.activity",
        default: "moderate",
        options: ACTIVITY_OPTIONS,
      },
      {
        name: "formula",
        kind: "select",
        labelKey: "calc.formula",
        default: "mifflin",
        options: [
          { value: "mifflin", labelKey: "calc.formula.mifflin" },
          { value: "harris", labelKey: "calc.formula.harris" },
          { value: "katch", labelKey: "calc.formula.katch" },
        ],
      },
    ],
    compute: (v) => {
      const b = bmr(str(v, "formula") as BmrFormula, {
        sex: str(v, "sex") as Sex,
        weightKg: num(v, "weight"),
        heightCm: num(v, "height"),
        age: num(v, "age"),
        bodyFatPct: num(v, "bodyFat"),
      });
      if (b <= 0) return null;
      const maintain = tdee(b, str(v, "activity") as ActivityLevel);
      return {
        primaryLabelKey: "calc.result.tdee",
        primaryValue: fmt(maintain),
        primaryUnit: "kcal",
        rows: [
          { labelKey: "calc.result.bmr", value: `${fmt(b)} kcal` },
          { labelKey: "calc.result.cut", value: `${fmt(maintain - 500)} kcal` },
          {
            labelKey: "calc.result.bulk",
            value: `${fmt(maintain + 300)} kcal`,
          },
        ],
      };
    },
  },

  macros: {
    id: "macros",
    fields: [
      {
        name: "calories",
        kind: "number",
        labelKey: "calc.calories",
        unit: "kcal",
        min: 800,
        max: 6000,
        step: 10,
        default: 2500,
      },
      {
        name: "weight",
        kind: "number",
        labelKey: "calc.weight",
        unit: "kg",
        min: 25,
        max: 350,
        step: 0.5,
        default: 80,
      },
      {
        name: "goal",
        kind: "select",
        labelKey: "calc.goalLabel",
        default: "maintain",
        options: GOAL_OPTIONS,
      },
    ],
    compute: (v) => {
      const cals = num(v, "calories");
      if (cals <= 0) return null;
      const m = macros(cals, num(v, "weight"), str(v, "goal") as Goal);
      return {
        primaryLabelKey: "calc.calories",
        primaryValue: fmt(cals),
        primaryUnit: "kcal",
        rows: [
          { labelKey: "calc.result.protein", value: `${fmt(m.protein)} g` },
          { labelKey: "calc.result.carbs", value: `${fmt(m.carbs)} g` },
          { labelKey: "calc.result.fat", value: `${fmt(m.fat)} g` },
        ],
        chart: {
          kind: "split",
          segments: [
            {
              labelKey: "calc.result.protein",
              value: m.protein * 4,
              color: C.green,
            },
            {
              labelKey: "calc.result.carbs",
              value: m.carbs * 4,
              color: C.blue,
            },
            { labelKey: "calc.result.fat", value: m.fat * 9, color: C.amber },
          ],
        },
      };
    },
  },

  bodyfat: {
    id: "bodyfat",
    fields: [
      {
        name: "sex",
        kind: "select",
        labelKey: "calc.sex",
        default: "male",
        options: SEX_OPTIONS,
      },
      {
        name: "height",
        kind: "number",
        labelKey: "calc.height",
        unit: "cm",
        min: 90,
        max: 250,
        step: 1,
        default: 180,
      },
      {
        name: "neck",
        kind: "number",
        labelKey: "calc.neck",
        unit: "cm",
        min: 20,
        max: 80,
        step: 0.5,
        default: 38,
      },
      {
        name: "waist",
        kind: "number",
        labelKey: "calc.waist",
        unit: "cm",
        min: 40,
        max: 200,
        step: 0.5,
        default: 85,
      },
      {
        name: "hip",
        kind: "number",
        labelKey: "calc.hip",
        unit: "cm",
        min: 40,
        max: 200,
        step: 0.5,
        default: 95,
      },
    ],
    compute: (v) => {
      const sex = str(v, "sex") as Sex;
      const bf = bodyFatNavy({
        sex,
        heightCm: num(v, "height"),
        neckCm: num(v, "neck"),
        waistCm: num(v, "waist"),
        hipCm: num(v, "hip"),
      });
      if (bf <= 0) return null;
      const bfSegments =
        sex === "male"
          ? [
              {
                upto: 6,
                color: C.blue,
                labelKey: "calc.bf.essential" as TranslationKey,
              },
              {
                upto: 14,
                color: C.green,
                labelKey: "calc.bf.athlete" as TranslationKey,
              },
              {
                upto: 18,
                color: C.lime,
                labelKey: "calc.bf.fitness" as TranslationKey,
              },
              {
                upto: 25,
                color: C.yellow,
                labelKey: "calc.bf.average" as TranslationKey,
              },
              {
                upto: 42,
                color: C.red,
                labelKey: "calc.bf.high" as TranslationKey,
              },
            ]
          : [
              {
                upto: 14,
                color: C.blue,
                labelKey: "calc.bf.essential" as TranslationKey,
              },
              {
                upto: 21,
                color: C.green,
                labelKey: "calc.bf.athlete" as TranslationKey,
              },
              {
                upto: 25,
                color: C.lime,
                labelKey: "calc.bf.fitness" as TranslationKey,
              },
              {
                upto: 32,
                color: C.yellow,
                labelKey: "calc.bf.average" as TranslationKey,
              },
              {
                upto: 48,
                color: C.red,
                labelKey: "calc.bf.high" as TranslationKey,
              },
            ];
      return {
        primaryLabelKey: "calc.result.bodyFat",
        primaryValue: fmt(bf),
        primaryUnit: "%",
        noteKey: BF_NOTE[bodyFatCategory(bf, sex)],
        chart: {
          kind: "scale",
          value: bf,
          min: sex === "male" ? 3 : 8,
          max: sex === "male" ? 42 : 48,
          segments: bfSegments,
        },
      };
    },
  },

  bmi: {
    id: "bmi",
    fields: [
      {
        name: "height",
        kind: "number",
        labelKey: "calc.height",
        unit: "cm",
        min: 90,
        max: 250,
        step: 1,
        default: 180,
      },
      {
        name: "weight",
        kind: "number",
        labelKey: "calc.weight",
        unit: "kg",
        min: 25,
        max: 350,
        step: 0.5,
        default: 80,
      },
    ],
    compute: (v) => {
      const value = bmi(num(v, "weight"), num(v, "height"));
      if (value <= 0) return null;
      const range = healthyWeightRange(num(v, "height"));
      return {
        primaryLabelKey: "calc.result.bmi",
        primaryValue: fmt(value),
        noteKey: BMI_NOTE[bmiCategory(value)],
        rows: [
          {
            labelKey: "calc.result.healthyRange",
            value: `${fmt(range.min)}–${fmt(range.max)} kg`,
          },
        ],
        chart: {
          kind: "scale",
          value,
          min: 15,
          max: 40,
          segments: [
            { upto: 18.5, color: C.blue, labelKey: "calc.bmi.underweight" },
            { upto: 25, color: C.green, labelKey: "calc.bmi.normal" },
            { upto: 30, color: C.yellow, labelKey: "calc.bmi.overweight" },
            { upto: 40, color: C.red, labelKey: "calc.bmi.obese" },
          ],
        },
      };
    },
  },

  ffmi: {
    id: "ffmi",
    fields: [
      {
        name: "weight",
        kind: "number",
        labelKey: "calc.weight",
        unit: "kg",
        min: 25,
        max: 350,
        step: 0.5,
        default: 80,
      },
      {
        name: "height",
        kind: "number",
        labelKey: "calc.height",
        unit: "cm",
        min: 90,
        max: 250,
        step: 1,
        default: 180,
      },
      {
        name: "bodyFat",
        kind: "number",
        labelKey: "calc.bodyFat",
        unit: "%",
        min: 1,
        max: 60,
        step: 0.5,
        default: 15,
      },
    ],
    compute: (v) => {
      const r = ffmi({
        weightKg: num(v, "weight"),
        heightCm: num(v, "height"),
        bodyFatPct: num(v, "bodyFat"),
      });
      if (r.normalized <= 0) return null;
      return {
        primaryLabelKey: "calc.result.ffmi",
        primaryValue: fmt(r.normalized),
        noteKey: FFMI_NOTE[ffmiBand(r.normalized)],
        rows: [{ labelKey: "calc.result.ffmiRaw", value: fmt(r.raw) }],
        chart: {
          kind: "scale",
          value: r.normalized,
          min: 16,
          max: 30,
          segments: [
            { upto: 18, color: C.red, labelKey: "calc.ffmi.below" },
            { upto: 20, color: C.orange, labelKey: "calc.ffmi.average" },
            { upto: 22, color: C.yellow, labelKey: "calc.ffmi.aboveAverage" },
            { upto: 23, color: C.lime, labelKey: "calc.ffmi.excellent" },
            { upto: 26, color: C.green, labelKey: "calc.ffmi.superior" },
            { upto: 30, color: C.violet, labelKey: "calc.ffmi.suspicious" },
          ],
        },
      };
    },
  },

  water: {
    id: "water",
    fields: [
      {
        name: "weight",
        kind: "number",
        labelKey: "calc.weight",
        unit: "kg",
        min: 25,
        max: 350,
        step: 0.5,
        default: 80,
      },
      {
        name: "activity",
        kind: "select",
        labelKey: "calc.activity",
        default: "moderate",
        options: ACTIVITY_OPTIONS,
      },
    ],
    compute: (v) => {
      const h = hydration(
        num(v, "weight"),
        str(v, "activity") as ActivityLevel,
      );
      if (h.ml <= 0) return null;
      return {
        primaryLabelKey: "calc.result.water",
        primaryValue: fmt(h.liters),
        primaryUnit: "L",
        rows: [
          { labelKey: "calc.result.milliliters", value: `${fmt(h.ml)} ml` },
          { labelKey: "calc.result.cups", value: fmt(h.cups) },
        ],
      };
    },
  },

  plates: {
    id: "plates",
    fields: [
      {
        name: "target",
        kind: "number",
        labelKey: "calc.targetWeight",
        unit: "kg",
        min: 20,
        max: 500,
        step: 2.5,
        default: 100,
      },
      {
        name: "bar",
        kind: "number",
        labelKey: "calc.barWeight",
        unit: "kg",
        min: 5,
        max: 25,
        step: 5,
        default: 20,
      },
    ],
    compute: (v) => {
      const r = plateLoad(num(v, "target"), num(v, "bar"));
      if (r.perSide <= 0) return null;
      return {
        primaryLabelKey: "calc.result.perSide",
        primaryValue: fmt(r.perSide),
        primaryUnit: "kg",
        rows: r.plates.map((p) => ({
          label: `${p.plate} kg`,
          value: `× ${p.count}`,
        })),
      };
    },
  },
};
