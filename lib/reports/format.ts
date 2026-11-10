import { signed } from "@/lib/body/units";
import { intlLocale, type Locale, type TFunction } from "@/lib/i18n/config";
import { exerciseLabel } from "@/lib/training/exercise-names";
import { muscleHeadKey } from "@/lib/training/muscles";

import type { Anomaly } from "./monthly";

/** What the email and the PDF both need to turn a report into words. */
export type ReportContext = {
  t: TFunction;
  locale: Locale;
  imperial: boolean;
  customNames: Record<string, string>;
};

export const monthLabel = (period: string, locale: Locale): string =>
  new Intl.DateTimeFormat(intlLocale(locale), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${period}-15T12:00:00Z`));

export const weightUnit = (imperial: boolean) => (imperial ? "lb" : "kg");
export const lengthUnit = (imperial: boolean) => (imperial ? "in" : "cm");

/** A month-over-month change; no change reads as ±0, not a bare zero. */
export const change = (current: number, previous: number): string =>
  current === previous ? "±0" : signed(current - previous);

export const reportFilename = (period: string) => `metri-report-${period}.pdf`;

/** One observation as a title and a sentence, the same in the email and PDF. */
export const anomalyText = (
  anomaly: Anomaly,
  { t, locale, customNames }: ReportContext,
): { title: string; body: string } => {
  switch (anomaly.id) {
    case "weight_fast":
      return {
        title: t(`monthlyReport.anomaly.weight_${anomaly.direction}.title`),
        body: t(`monthlyReport.anomaly.weight_${anomaly.direction}.body`, {
          rate: anomaly.ratePct,
        }),
      };
    case "training_gap":
      return {
        title: t("monthlyReport.anomaly.gap.title"),
        body: t("monthlyReport.anomaly.gap.body", { days: anomaly.days }),
      };
    case "strength_drop":
      return {
        title: t("monthlyReport.anomaly.strength.title", {
          exercise: exerciseLabel(anomaly.exerciseId, locale, customNames),
        }),
        body: t("monthlyReport.anomaly.strength.body", { pct: anomaly.pct }),
      };
    case "volume_spike":
      return {
        title: t("monthlyReport.anomaly.volume.title"),
        body: t("monthlyReport.anomaly.volume.body", { pct: anomaly.pct }),
      };
    case "muscle_drop":
      return {
        title: t("monthlyReport.anomaly.muscle.title", {
          muscle: t(muscleHeadKey(anomaly.head)),
        }),
        body: t("monthlyReport.anomaly.muscle.body", {
          now: anomaly.setsPerWeek,
          usual: anomaly.usualPerWeek,
        }),
      };
  }
};
