"use client";

import Link from "next/link";

import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { routePath } from "@/lib/i18n/routes";
import { formatDay } from "@/lib/roadmap/format";
import type { Plan } from "@/lib/roadmap/recommend";
import type { Schedule } from "@/lib/roadmap/steps";

/** One row of the plan's numbers: the label left, the value right. Values
 * wrap instead of truncating, so a long pace or calorie line stays whole. */
const Stat = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) => (
  <div className="flex items-baseline justify-between gap-4 px-3 py-2.5">
    <dt className="shrink-0 font-mono text-[11px] tracking-wide text-ink-400 uppercase">
      {label}
    </dt>
    <dd className="min-w-0 text-right">
      <span className="block font-mono text-sm [overflow-wrap:anywhere] text-ink-50">
        {value}
      </span>
      {sub ? (
        <span className="mt-0.5 block text-xs [overflow-wrap:anywhere] text-ink-400">
          {sub}
        </span>
      ) : null}
    </dd>
  </div>
);

/**
 * The plan in one card: the phase and why, then the numbers to hold (body fat
 * now → target, pace, calories, block dates) and the lead-in, if any.
 */
export const PlanSummary = ({
  plan,
  schedule,
  maintenanceKcal,
  startedAt,
}: {
  plan: Plan;
  schedule: Schedule;
  maintenanceKcal: number | null;
  startedAt: string;
}) => {
  const { t, locale } = useI18n();
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const bf = nf.format(Math.round(plan.bodyFatPct * 10) / 10);
  const signed = (n: number) =>
    `${n > 0 ? "+" : n < 0 ? "−" : ""}${nf.format(Math.abs(n))}`;

  const pace =
    plan.weeklyRateKg !== null
      ? t("roadmap.stat.paceKg", { kg: signed(plan.weeklyRateKg) })
      : plan.weeklyRatePct !== null
        ? t("roadmap.stat.pacePct", { pct: signed(plan.weeklyRatePct) })
        : t("roadmap.stat.paceHold");
  const paceSub =
    plan.weeklyRateKg !== null && plan.weeklyRatePct !== null
      ? t("roadmap.stat.pacePct", { pct: signed(plan.weeklyRatePct) })
      : undefined;

  const delta = plan.dailyKcalDelta;
  const calories =
    delta === null
      ? null
      : delta === 0
        ? {
            value:
              maintenanceKcal !== null
                ? t("roadmap.stat.kcal", { kcal: nf.format(maintenanceKcal) })
                : t("roadmap.stat.kcalHold"),
          }
        : maintenanceKcal !== null
          ? {
              value: t("roadmap.stat.kcal", {
                kcal: nf.format(
                  Math.round((maintenanceKcal + delta) / 10) * 10,
                ),
              }),
              sub: t("roadmap.stat.kcalFrom", {
                maintenance: nf.format(maintenanceKcal),
                delta: signed(delta),
              }),
            }
          : { value: t("roadmap.stat.kcalDelta", { delta: signed(delta) }) };

  const docs = routePath("docs", locale);

  return (
    <section
      aria-labelledby="roadmap-plan"
      className="rounded-card border border-ink-600 bg-ink-800 p-5"
    >
      <p className="font-mono text-[11px] tracking-wide text-brand uppercase">
        {t("roadmap.why")}
      </p>
      <h2 id="roadmap-plan" className="mt-1 text-xl font-semibold text-ink-50">
        {t(`roadmap.phase.${plan.phase}` as TranslationKey)}
      </h2>
      <p className="mt-1 text-sm text-ink-300">
        {t(`roadmap.phase.${plan.phase}.line` as TranslationKey)}
      </p>

      {plan.lead !== "none" ? (
        <p className="mt-4 rounded-field border border-brand/30 bg-brand/5 px-3 py-2 text-sm text-ink-100">
          {t(`roadmap.lead.${plan.lead}` as TranslationKey, {
            date: formatDay(schedule.phaseStart, locale),
          })}
        </p>
      ) : null}

      <dl className="mt-4 divide-y divide-ink-700 rounded-field border border-ink-700 bg-ink-850">
        <Stat
          label={t("roadmap.stat.bodyFat")}
          value={
            plan.targetBodyFatPct !== null
              ? `${bf}% → ${nf.format(plan.targetBodyFatPct)}%`
              : `${bf}%`
          }
        />
        <Stat label={t("roadmap.stat.pace")} value={pace} sub={paceSub} />
        {calories ? (
          <Stat
            label={t("roadmap.stat.calories")}
            value={calories.value}
            sub={calories.sub}
          />
        ) : null}
        <Stat
          label={t("roadmap.stat.block")}
          value={t("roadmap.stat.weeks", {
            weeks: String(schedule.totalWeeks),
          })}
          sub={t("roadmap.stat.dates", {
            start: formatDay(startedAt, locale),
            end: formatDay(schedule.phaseEnd, locale),
          })}
        />
      </dl>

      {plan.totalWeeks !== null && plan.targetBodyFatPct !== null ? (
        <p className="mt-3 text-xs leading-relaxed text-ink-400">
          {t("roadmap.totalWeeks", {
            target: nf.format(plan.targetBodyFatPct),
            weeks: String(plan.totalWeeks),
            block: String(plan.blockWeeks),
          })}
        </p>
      ) : null}

      <ul className="mt-4 space-y-2 border-t border-ink-700 pt-4">
        {plan.reasons.map((reason) => (
          <li
            key={reason}
            className={
              reason === "caution"
                ? "rounded-field border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm leading-relaxed text-red-200"
                : "flex gap-2 text-sm leading-relaxed text-ink-200"
            }
          >
            {reason === "caution" ? null : (
              <span
                aria-hidden
                className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
              />
            )}
            <span>
              {t(`roadmap.reason.${reason}` as TranslationKey, { bf })}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-ink-400">
        {t("roadmap.whyLinks")}{" "}
        <Link
          href={`${docs}/choosing-your-phase`}
          className="font-medium text-brand underline underline-offset-2"
        >
          {t("roadmap.link.phase")}
        </Link>
        {" · "}
        <Link
          href={`${docs}/somatotypes`}
          className="font-medium text-brand underline underline-offset-2"
        >
          {t("roadmap.q.bodyFat.somatotypes")}
        </Link>
      </p>
    </section>
  );
};
