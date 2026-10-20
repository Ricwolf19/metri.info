import Link from "next/link";

import { BodyActions } from "@/components/body/BodyActions";
import { BodyMap } from "@/components/body/BodyMap";
import { TapeList } from "@/components/body/TapeList";
import { WeightChart } from "@/components/body/WeightChart";
import { ArrowLeftIcon, CloudSyncIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { FIGURES } from "@/lib/body/figure";
import { encodeBodyShare } from "@/lib/body/share";
import { siteLabelKey } from "@/lib/body/sites";
import { displayLength, displayWeight, signed } from "@/lib/body/units";
import { MIN_WEIGH_INS } from "@/lib/body/weekly";
import { can } from "@/lib/entitlements";
import { premiumRequestPath } from "@/lib/contact/types";
import { createT, intlLocale, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import type { BodyWindow } from "@/lib/body/windows";
import { getBodySnapshot } from "@/lib/sync/body";
import { cn } from "@/lib/utils";

const Stat = ({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "brand" | "flame";
}) => (
  <div className="rounded-card border border-ink-600 bg-ink-800 p-4 sm:p-5">
    <dt className="font-mono text-[11px] tracking-wide text-ink-400 uppercase">
      {label}
    </dt>
    <dd
      className={cn(
        "mt-1 font-mono text-2xl font-bold tabular-nums sm:text-3xl",
        tone === "brand"
          ? "text-brand"
          : tone === "flame"
            ? "text-flame"
            : "text-ink-50",
      )}
    >
      <AnimatedNumber value={value} />
      {unit && (
        <span className="ml-1 text-sm font-normal text-ink-400">{unit}</span>
      )}
    </dd>
  </div>
);

const Section = ({
  id,
  title,
  hint,
  children,
}: {
  id: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) => (
  <section
    id={id}
    className="mt-10 scroll-mt-24 first:mt-0 print:break-inside-avoid"
  >
    <h2 className="text-lg font-semibold text-ink-50">{title}</h2>
    <p className="mt-1 text-sm text-ink-300">{hint}</p>
    <div className="mt-5">{children}</div>
  </section>
);

/**
 * "Body & training map": the app's Metrics tab, read-only on the web from
 * the premium sync mirror. Weight as weekly averages, the tape, and the
 * muscle map over the sets the app logged, plus a share card and exports.
 * Free accounts see the upsell; a Premium account with nothing synced sees
 * where the data comes from. Shared by /account/body and /es/cuenta/cuerpo.
 */
export const BodyView = async ({
  userId,
  plan,
  sex,
  imperial,
  locale,
  windowDays,
}: {
  userId: string;
  plan: string | null | undefined;
  sex: string | null | undefined;
  imperial: boolean;
  locale: Locale;
  windowDays: BodyWindow;
}) => {
  const t = createT(locale);
  const back = (
    <Link
      href={routePath("activity", locale)}
      className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-300 transition-colors hover:text-accent print:hidden"
    >
      <ArrowLeftIcon size={16} />
      {t("body.back")}
    </Link>
  );
  const hero = (children: React.ReactNode) => (
    <PageHero
      eyebrow={t("body.eyebrow")}
      title={t("body.title")}
      subtitle={t("body.subtitle")}
      align="left"
      compact
    >
      {children}
    </PageHero>
  );

  if (!can(plan, "sync")) {
    return (
      <>
        {hero(back)}
        <Container className="py-10 sm:py-14">
          <div className="relative overflow-hidden rounded-card border border-ink-600 bg-ink-850 p-6">
            <div
              aria-hidden
              className="glow-brand pointer-events-none absolute inset-x-0 top-0 h-24"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field border border-brand/30 bg-brand/10 text-brand">
                  <CloudSyncIcon size={20} />
                </span>
                <div>
                  <p className="font-semibold text-ink-50">
                    {t("activity.sync.upsellTitle")}
                  </p>
                  <p className="mt-1 max-w-xl text-sm text-ink-300">
                    {t("activity.sync.upsellBody")}
                  </p>
                </div>
              </div>
              <Link
                href={premiumRequestPath(locale)}
                className="shrink-0 rounded-field border border-brand/40 px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
              >
                {t("account.tier.request")}
              </Link>
            </div>
          </div>
        </Container>
      </>
    );
  }

  const snap = await getBodySnapshot(userId, sex);

  if (!snap.hasAnyData) {
    return (
      <>
        {hero(back)}
        <Container className="py-10 sm:py-14">
          <div className="flex items-start gap-3 rounded-card border border-dashed border-ink-600 p-6 text-sm text-ink-300">
            <CloudSyncIcon size={18} className="mt-0.5 shrink-0 text-ink-400" />
            <p>{t("body.empty")}</p>
          </div>
        </Container>
      </>
    );
  }

  const figureSex = sex === "female" ? "female" : "male";
  const figures = {
    front: FIGURES[`${figureSex}_front`],
    back: FIGURES[`${figureSex}_back`],
  };
  const weight = (kg: number) => displayWeight(kg, imperial);
  const length = (cm: number) => displayLength(cm, imperial);
  const weightUnit = imperial ? "lb" : "kg";
  const lengthUnit = imperial ? "in" : "cm";
  const latestFat = snap.bodyFat[snap.bodyFat.length - 1] ?? null;
  const thisWeek = snap.weeks[snap.weeks.length - 1];
  const missing = thisWeek ? Math.max(0, MIN_WEIGH_INS - thisWeek.n) : 0;
  const current = snap.muscles[windowDays];

  const token = encodeBodyShare({
    sex: figureSex === "female" ? "f" : "m",
    windowDays,
    weekAvgKg: snap.thisWeekAvgKg,
    deltaKg: snap.weightDeltaKg,
    bodyFatPct: latestFat?.pct ?? null,
    sessions: current.sessions,
    keySite: snap.keySite,
    keySiteDeltaCm: snap.keySiteDeltaCm,
    balance: current.loads.balance.map((b) => b.status),
  });

  const printed = new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "long",
  }).format(new Date());

  return (
    <>
      {hero(
        <>
          {back}
          <BodyActions
            token={token}
            exportPath={`${routePath("body", "en")}/export`}
          />
          <p className="mt-4 hidden font-mono text-xs text-ink-500 print:block">
            {t("body.printedOn", { date: printed })}
          </p>
        </>,
      )}

      <Container className="py-10 sm:py-14">
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label={t("body.weekAverage")}
            value={
              snap.thisWeekAvgKg === null
                ? "—"
                : weight(snap.thisWeekAvgKg).toFixed(1)
            }
            unit={snap.thisWeekAvgKg === null ? undefined : weightUnit}
          />
          <Stat
            label={t("body.vsLastWeek")}
            value={
              snap.weightDeltaKg === null
                ? "—"
                : signed(weight(snap.weightDeltaKg))
            }
            unit={snap.weightDeltaKg === null ? undefined : weightUnit}
            tone={
              snap.weightDeltaKg === null || Math.abs(snap.weightDeltaKg) < 0.05
                ? undefined
                : snap.weightDeltaKg < 0
                  ? "brand"
                  : "flame"
            }
          />
          <Stat
            label={t(siteLabelKey(snap.keySite))}
            value={
              snap.keySiteDeltaCm === null
                ? "—"
                : signed(length(snap.keySiteDeltaCm))
            }
            unit={snap.keySiteDeltaCm === null ? undefined : lengthUnit}
          />
          <Stat
            label={t("body.bodyFat")}
            value={latestFat ? latestFat.pct.toFixed(1) : "—"}
            unit={latestFat ? "%" : undefined}
          />
        </dl>

        <Section
          id="weight"
          title={t("body.sectionWeight")}
          hint={t("body.sectionWeightHint")}
        >
          <div className="rounded-card border border-ink-600 bg-ink-800 p-5 sm:p-6">
            <WeightChart
              weighIns={snap.weighIns.map((w) => ({
                ...w,
                weightKg: weight(w.weightKg),
              }))}
              weeks={snap.weeks.map((w) => ({
                ...w,
                avgKg: w.avgKg === null ? null : weight(w.avgKg),
              }))}
              today={snap.today}
              locale={locale}
              t={t}
            />
            {snap.weighIns.length > 0 && missing > 0 ? (
              <p className="mt-3 text-xs text-ink-500">
                {t("body.needMore", { n: missing })}
              </p>
            ) : null}
          </div>
        </Section>

        <Section
          id="tape"
          title={t("body.sectionTape")}
          hint={t("body.sectionTapeHint")}
        >
          <TapeList
            sites={snap.sites}
            keySite={snap.keySite}
            imperial={imperial}
            locale={locale}
            t={t}
          />
        </Section>

        <Section
          id="map"
          title={t("body.sectionMap")}
          hint={t("body.sectionMapHint")}
        >
          <BodyMap
            figures={figures}
            muscles={snap.muscles}
            initialWindow={windowDays}
            customNames={snap.customNames}
          />
        </Section>
      </Container>
    </>
  );
};
