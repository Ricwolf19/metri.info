"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { BodyFatQuestion } from "@/components/roadmap/BodyFatQuestion";
import { ChoiceCards } from "@/components/roadmap/ChoiceCards";
import { DiagnosticIntro } from "@/components/roadmap/DiagnosticIntro";
import {
  type DiagnosticValues,
  QUESTION_FIELDS,
  RADIO_QUESTIONS,
  toAnswers,
  toFormValues,
} from "@/components/roadmap/diagnostic-form";
import { QuestionError } from "@/components/roadmap/QuestionError";
import { WeightQuestion } from "@/components/roadmap/WeightQuestion";
import { Button } from "@/components/ui/button";
import type { CalcFacts } from "@/lib/calculators/prefill";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { type Answers, QUESTIONS } from "@/lib/roadmap/diagnostic";
import { cn } from "@/lib/utils";

/**
 * The roadmap's intake: ten questions, one per screen, each validated before
 * the next. Signed-in users start with their sex, body fat, weight and phase
 * filled in from their account; a retake starts from the last answers.
 */
export const Diagnostic = ({
  previous,
  facts,
  imperial,
  onComplete,
  onCancel,
}: {
  previous: Answers | null;
  facts: CalcFacts | null;
  imperial: boolean;
  onComplete: (answers: Answers) => void;
  onCancel?: () => void;
}) => {
  const t = useT();
  const [started, setStarted] = useState(previous !== null);
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const form = useForm<DiagnosticValues>({
    defaultValues: toFormValues(previous, facts, imperial),
  });
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = form;

  // Each new question takes focus, so a screen reader starts reading it.
  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [index, started]);

  if (!started) {
    return (
      <DiagnosticIntro
        guest={facts === null}
        onStart={() => {
          moved.current = true;
          setStarted(true);
        }}
      />
    );
  }

  const question = QUESTIONS[index];
  const last = index === QUESTIONS.length - 1;
  const radio = RADIO_QUESTIONS[question];
  const hintId = `roadmap-${question}-hint`;
  const prefilled =
    previous === null &&
    ((question === "sex" && facts?.sex) ||
      (question === "bodyFat" && facts?.bodyFatPct) ||
      (question === "weight" && facts?.weightKg));

  const go = (to: number) => {
    moved.current = true;
    setIndex(to);
  };
  const next = async () => {
    if (await trigger(QUESTION_FIELDS[question])) go(index + 1);
  };
  const finish = handleSubmit((values) => {
    const answers = toAnswers(values, imperial);
    if (answers) onComplete(answers);
  });

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void (last ? finish() : next());
        }}
        className="mx-auto max-w-xl rounded-card border border-ink-600 bg-ink-800 p-5 sm:p-7"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs tracking-wide text-ink-400 uppercase">
            {t("roadmap.q.progress", {
              n: String(index + 1),
              total: String(QUESTIONS.length),
            })}
          </p>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-medium text-ink-400 hover:text-ink-100"
            >
              {t("roadmap.cancel")}
            </button>
          ) : null}
        </div>
        <div
          aria-hidden
          className="mt-2 h-1 overflow-hidden rounded-full bg-ink-700"
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300"
            style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <h2
          ref={heading}
          tabIndex={-1}
          className="mt-6 scroll-mt-24 text-lg font-semibold text-balance text-ink-50 focus:outline-none"
        >
          {t(`roadmap.q.${question}` as TranslationKey)}
        </h2>
        {prefilled ? (
          <p className="mt-1 text-xs text-brand">{t("roadmap.q.prefilled")}</p>
        ) : null}

        <div className="mt-5">
          {radio ? (
            <>
              {radio.hint ? (
                <p id={hintId} className="-mt-3 mb-4 text-sm text-ink-400">
                  {t(`roadmap.q.${question}.hint` as TranslationKey)}
                </p>
              ) : null}
              <ChoiceCards
                legend={t(`roadmap.q.${question}` as TranslationKey)}
                choices={radio.values.map((value) => ({
                  value,
                  label: t(`roadmap.q.${question}.${value}` as TranslationKey),
                  description: radio.described
                    ? t(`roadmap.q.${question}.${value}.desc` as TranslationKey)
                    : undefined,
                }))}
                registration={register(radio.field, {
                  required: t("roadmap.q.required"),
                })}
                describedBy={radio.hint ? hintId : undefined}
                columns={radio.columns}
              />
              <QuestionError message={errors[radio.field]?.message} />
            </>
          ) : null}
          {question === "bodyFat" ? <BodyFatQuestion hintId={hintId} /> : null}
          {question === "weight" ? (
            <WeightQuestion imperial={imperial} hintId={hintId} />
          ) : null}
        </div>

        <div
          className={cn(
            "mt-7 flex items-center gap-3",
            index > 0 ? "justify-between" : "justify-end",
          )}
        >
          {index > 0 ? (
            <Button type="button" variant="ghost" onClick={() => go(index - 1)}>
              {t("roadmap.q.back")}
            </Button>
          ) : null}
          <Button type="submit" variant={last ? "brand" : "primary"}>
            {last ? t("roadmap.q.finish") : t("roadmap.q.next")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
