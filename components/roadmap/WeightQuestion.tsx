"use client";

import { useFormContext } from "react-hook-form";

import {
  type DiagnosticValues,
  parseNum,
  weightBounds,
} from "@/components/roadmap/diagnostic-form";
import { QuestionError } from "@/components/roadmap/QuestionError";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";

/** Optional body weight, in the unit the person uses; it turns the plan's
 * percentages into kilograms and calories. */
export const WeightQuestion = ({
  imperial,
  hintId,
}: {
  imperial: boolean;
  hintId: string;
}) => {
  const t = useT();
  const {
    register,
    formState: { errors },
  } = useFormContext<DiagnosticValues>();
  const { min, max, unit } = weightBounds(imperial);
  return (
    <div>
      <p id={hintId} className="-mt-3 mb-4 text-sm text-ink-400">
        {t("roadmap.q.weight.hint")}
      </p>
      <Label htmlFor="roadmap-weight" className="mb-1.5 block">
        {t("roadmap.q.weight.label")}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id="roadmap-weight"
          type="number"
          inputMode="decimal"
          step="0.1"
          min={min}
          max={max}
          aria-describedby={hintId}
          aria-invalid={Boolean(errors.weight) || undefined}
          className="max-w-32 font-mono"
          {...register("weight", {
            validate: (v) => {
              const n = parseNum(v);
              return (
                n === null ||
                (n >= min && n <= max) ||
                t("roadmap.q.weight.range", {
                  min: String(min),
                  max: String(max),
                  unit,
                })
              );
            },
          })}
        />
        <span className="font-mono text-sm text-ink-400">{unit}</span>
      </div>
      <QuestionError message={errors.weight?.message} />
    </div>
  );
};
