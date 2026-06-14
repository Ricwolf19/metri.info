import type { TranslationKey } from "@/lib/i18n/en";

export type CalcId =
  | "onerm"
  | "tdee"
  | "macros"
  | "bodyfat"
  | "bmi"
  | "ffmi"
  | "water"
  | "plates";

export type SelectOption = { value: string; labelKey: TranslationKey };

export type CalcField =
  | {
      name: string;
      kind: "number";
      labelKey: TranslationKey;
      unit?: string;
      min?: number;
      max?: number;
      step?: number;
      default: number;
    }
  | {
      name: string;
      kind: "select";
      labelKey: TranslationKey;
      options: SelectOption[];
      default: string;
    };

export type ResultRow = {
  label?: string;
  labelKey?: TranslationKey;
  value: string;
};

export type CalcResult = {
  primaryLabelKey: TranslationKey;
  primaryValue: string;
  primaryUnit?: string;
  rows?: ResultRow[];
  noteKey?: TranslationKey;
} | null;

export type CalcValues = Record<string, number | string>;

export type CalcConfig = {
  id: CalcId;
  fields: CalcField[];
  compute: (v: CalcValues) => CalcResult;
};
