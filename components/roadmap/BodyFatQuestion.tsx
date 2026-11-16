"use client";

import Link from "next/link";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { ChoiceCards } from "@/components/roadmap/ChoiceCards";
import {
  type DiagnosticValues,
  parseNum,
} from "@/components/roadmap/diagnostic-form";
import { QuestionError } from "@/components/roadmap/QuestionError";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Segmented } from "@/components/ui/segmented";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { routePath } from "@/lib/i18n/routes";
import {
  BAND_RANGE,
  BODY_FAT_BANDS,
  BODY_FAT_RANGE,
} from "@/lib/roadmap/diagnostic";

/** Body fat, typed when known or picked from five visual bands whose ranges
 * follow the sex answered before. Links the calculator to measure it and the
 * guide on why body type isn't the question. */
export const BodyFatQuestion = ({ hintId }: { hintId: string }) => {
  const { t, locale } = useI18n();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DiagnosticValues>();
  const [sex, mode] = useWatch({ control, name: ["sex", "bodyFatMode"] });

  return (
    <div className="space-y-4">
      <p id={hintId} className="-mt-3 text-sm text-ink-400">
        {t("roadmap.q.bodyFat.hint")}{" "}
        <Link
          href={`${routePath("docs", locale)}/somatotypes`}
          className="font-medium text-brand underline underline-offset-2"
        >
          {t("roadmap.q.bodyFat.somatotypes")}
        </Link>
      </p>
      <Controller
        control={control}
        name="bodyFatMode"
        render={({ field }) => (
          <Segmented
            value={field.value}
            onValueChange={field.onChange}
            options={[
              { value: "estimate", label: t("roadmap.q.bodyFat.estimate") },
              { value: "known", label: t("roadmap.q.bodyFat.known") },
            ]}
            aria-label={t("roadmap.q.bodyFat")}
            className="w-full"
          />
        )}
      />
      {mode === "known" ? (
        <div>
          <Label htmlFor="roadmap-bf" className="mb-1.5 block">
            {t("roadmap.q.bodyFat.label")}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="roadmap-bf"
              type="number"
              inputMode="decimal"
              step="0.5"
              min={BODY_FAT_RANGE.min}
              max={BODY_FAT_RANGE.max}
              aria-invalid={Boolean(errors.bodyFatPct) || undefined}
              className="max-w-32 font-mono"
              {...register("bodyFatPct", {
                validate: (v, all) => {
                  if (all.bodyFatMode !== "known") return true;
                  const n = parseNum(v);
                  return (
                    (n !== null &&
                      n >= BODY_FAT_RANGE.min &&
                      n <= BODY_FAT_RANGE.max) ||
                    t("roadmap.q.bodyFat.range", {
                      min: String(BODY_FAT_RANGE.min),
                      max: String(BODY_FAT_RANGE.max),
                    })
                  );
                },
              })}
            />
            <span className="font-mono text-sm text-ink-400">%</span>
          </div>
          <QuestionError message={errors.bodyFatPct?.message} />
        </div>
      ) : (
        <>
          <ChoiceCards
            legend={t("roadmap.q.bodyFat")}
            choices={BODY_FAT_BANDS.map((band) => ({
              value: band,
              label: t(`roadmap.q.band.${band}` as TranslationKey),
              description: t(`roadmap.q.band.${band}.desc` as TranslationKey),
              meta: BAND_RANGE[sex === "female" ? "female" : "male"][band],
            }))}
            registration={register("bodyFatBand", {
              validate: (v, all) =>
                all.bodyFatMode !== "estimate" ||
                v !== "" ||
                t("roadmap.q.required"),
            })}
          />
          <QuestionError message={errors.bodyFatBand?.message} />
        </>
      )}
      <Link
        href={routePath("bodyfat", locale)}
        target="_blank"
        className="inline-block text-sm font-medium text-brand underline underline-offset-2"
      >
        {t("roadmap.q.bodyFat.measure")}
      </Link>
    </div>
  );
};
