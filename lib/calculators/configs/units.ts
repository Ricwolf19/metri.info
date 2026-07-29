import { KG_PER_LB, kgToLb, lbToKg } from "@/lib/calculations";
import { C, fmt, num, str } from "../_shared";
import type { CalcConfig } from "../types";

export const lbkgConfig: CalcConfig = {
  id: "lbkg",
  fields: [
    {
      name: "value",
      kind: "number",
      labelKey: "calc.value",
      min: 0,
      max: 1000,
      step: 0.5,
      default: 100,
      presets: [2.5, 10, 20, 45, 100, 135, 225, 315],
    },
    {
      name: "direction",
      kind: "select",
      labelKey: "calc.direction",
      default: "lbkg",
      options: [
        { value: "lbkg", labelKey: "calc.direction.lbkg" },
        { value: "kglb", labelKey: "calc.direction.kglb" },
      ],
    },
  ],
  compute: (v) => {
    const value = num(v, "value");
    if (value <= 0) return null;
    const toKg = str(v, "direction") !== "kglb";
    const lb = toKg ? value : kgToLb(value);
    const kg = toKg ? lbToKg(value) : value;
    return {
      primaryLabelKey: toKg ? "calc.result.kilograms" : "calc.result.pounds",
      primaryValue: fmt(toKg ? kg : lb),
      primaryUnit: toKg ? "kg" : "lb",
      rows: [
        {
          labelKey: toKg ? "calc.result.pounds" : "calc.result.kilograms",
          value: toKg ? `${fmt(lb)} lb` : `${fmt(kg)} kg`,
        },
        {
          labelKey: "calc.result.factor",
          value: `1 lb = ${KG_PER_LB} kg`,
        },
        { label: "1 kg", value: `${fmt(kgToLb(1))} lb` },
      ],
      chart: {
        kind: "bars",
        max: Math.max(lb, kg),
        bars: [
          {
            label: "lb",
            value: lb,
            display: `${fmt(lb)} lb`,
            color: C.blue,
            highlight: !toKg,
          },
          {
            label: "kg",
            value: kg,
            display: `${fmt(kg)} kg`,
            color: C.lime,
            highlight: toKg,
          },
        ],
      },
    };
  },
};
