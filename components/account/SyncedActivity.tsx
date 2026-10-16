import Link from "next/link";

import {
  AppleIcon,
  CloudSyncIcon,
  DumbbellIcon,
  type IconProps,
  LeafIcon,
  ScaleIcon,
} from "@/components/icons";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { can } from "@/lib/entitlements";
import {
  createT,
  intlLocale,
  type Locale,
  type TFunction,
} from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n/en";
import { premiumRequestPath } from "@/lib/contact/types";
import { getSyncedSnapshot, type WeighIn } from "@/lib/sync/views";
import { cn } from "@/lib/utils";

const PHASE_KEY: Record<string, TranslationKey> = {
  cut: "calc.goal.cut",
  maintain: "calc.goal.maintain",
  recomp: "activity.sync.phaseRecomp",
  bulk: "calc.goal.bulk",
};

const dateFmt = (locale: Locale, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(intlLocale(locale), opts);

const minutes = (seconds: number | null) =>
  seconds === null ? null : Math.max(1, Math.round(seconds / 60));

const Tile = ({
  icon: Icon,
  title,
  className,
  children,
}: {
  icon: React.ComponentType<IconProps>;
  title: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={cn(
      "flex flex-col rounded-card border border-ink-600 bg-ink-800 p-5",
      className,
    )}
  >
    <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-50">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-700 text-brand">
        <Icon size={15} />
      </span>
      {title}
    </h3>
    <div className="mt-4 flex-1">{children}</div>
  </section>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-ink-400">{children}</p>
);

const sparkPath = (values: number[], w: number, h: number) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

const WeightTrend = ({
  weighIns,
  locale,
  t,
}: {
  weighIns: WeighIn[];
  locale: Locale;
  t: TFunction;
}) => {
  if (weighIns.length === 0)
    return <Empty>{t("activity.sync.noWeighIns")}</Empty>;
  const latest = weighIns[weighIns.length - 1];
  const last7 = weighIns.slice(-7);
  const prev7 = weighIns.slice(-14, -7);
  const avg = (xs: WeighIn[]) =>
    xs.reduce((s, w) => s + w.weightKg, 0) / (xs.length || 1);
  const delta = prev7.length > 0 ? avg(last7) - avg(prev7) : null;
  const fmt = dateFmt(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-3xl font-bold text-ink-50 tabular-nums">
          <AnimatedNumber value={latest.weightKg.toFixed(1)} />
          <span className="ml-1 text-sm text-ink-400">kg</span>
        </p>
        {delta !== null && (
          <p
            className={cn(
              "font-mono text-sm tabular-nums",
              Math.abs(delta) < 0.05
                ? "text-ink-400"
                : delta < 0
                  ? "text-brand"
                  : "text-flame",
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)} kg · {t("activity.sync.weekOverWeek")}
          </p>
        )}
      </div>
      <svg
        viewBox="0 0 300 64"
        className="mt-3 h-16 w-full"
        fill="none"
        aria-hidden
      >
        <path
          d={sparkPath(
            weighIns.map((w) => w.weightKg),
            300,
            64,
          )}
          stroke="rgb(var(--brand))"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="mt-1 flex justify-between font-mono text-[11px] text-ink-500">
        <span>{fmt.format(new Date(`${weighIns[0].date}T00:00:00Z`))}</span>
        <span>
          {weighIns.length} {t("activity.sync.weighInsCount")}
        </span>
        <span>{fmt.format(new Date(`${latest.date}T00:00:00Z`))}</span>
      </p>
    </div>
  );
};

/**
 * What the app has synced, read-only: weigh-in trend, last sessions, the last
 * week of food and the active nutrition phase. Free accounts see what Premium
 * would show here and a request link; Premium accounts with nothing synced
 * yet see where the data comes from.
 */
export const SyncedActivity = async ({
  userId,
  plan,
  locale,
}: {
  userId: string;
  plan: string | null | undefined;
  locale: Locale;
}) => {
  const t = createT(locale);

  if (!can(plan, "sync")) {
    return (
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
    );
  }

  const snap = await getSyncedSnapshot(userId);

  if (!snap.hasAnyData) {
    return (
      <div className="flex items-start gap-3 rounded-card border border-dashed border-ink-600 p-6 text-sm text-ink-300">
        <CloudSyncIcon size={18} className="mt-0.5 shrink-0 text-ink-400" />
        <p>{t("activity.sync.empty")}</p>
      </div>
    );
  }

  const sessionDate = dateFmt(locale, { month: "short", day: "numeric" });
  const dayLabel = dateFmt(locale, { weekday: "short", timeZone: "UTC" });
  const maxKcal = Math.max(
    1,
    ...snap.foodDays.map((d) => d.kcal),
    snap.phase?.targetKcal ?? 0,
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Tile icon={ScaleIcon} title={t("activity.sync.weight")}>
        <WeightTrend weighIns={snap.weighIns} locale={locale} t={t} />
      </Tile>

      <Tile icon={DumbbellIcon} title={t("activity.sync.sessions")}>
        {snap.sessions.length === 0 ? (
          <Empty>{t("activity.sync.noSessions")}</Empty>
        ) : (
          <ul className="divide-y divide-ink-700">
            {snap.sessions.map((s) => {
              const mins = minutes(s.durationSeconds);
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink-50">
                      {s.name ?? t("activity.sync.session")}
                    </span>
                    <span className="block font-mono text-[11px] text-ink-400">
                      {sessionDate.format(new Date(s.startedAt))}
                      {s.weekNumber
                        ? ` · ${t("activity.sync.week", { n: s.weekNumber })}`
                        : ""}
                    </span>
                  </span>
                  {mins !== null && (
                    <span className="shrink-0 font-mono text-sm text-ink-200 tabular-nums">
                      {mins} min
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Tile>

      <Tile icon={AppleIcon} title={t("activity.sync.nutrition")}>
        {snap.foodDays.length === 0 ? (
          <Empty>{t("activity.sync.noFood")}</Empty>
        ) : (
          <div>
            <div className="flex h-28 items-end gap-2">
              {snap.foodDays.map((d) => {
                const h = Math.round((d.kcal / maxKcal) * 100);
                const over = snap.phase?.targetKcal
                  ? d.kcal > snap.phase.targetKcal
                  : false;
                return (
                  <div
                    key={d.date}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <span className="font-mono text-[10px] text-ink-300 tabular-nums">
                      {d.kcal}
                    </span>
                    <span
                      className={cn(
                        "chart-anim w-full rounded-md",
                        over ? "bg-flame/80" : "bg-brand",
                      )}
                      style={{ height: `${Math.max(6, h)}%` }}
                    />
                    <span className="font-mono text-[10px] text-ink-500 uppercase">
                      {dayLabel.format(new Date(`${d.date}T00:00:00Z`))}
                    </span>
                  </div>
                );
              })}
            </div>
            {snap.phase?.targetKcal ? (
              <p className="mt-3 font-mono text-[11px] text-ink-400">
                {t("activity.sync.target")}: {snap.phase.targetKcal} kcal
                {snap.phase.proteinG
                  ? ` · ${snap.phase.proteinG} g ${t("calc.result.protein").toLowerCase()}`
                  : ""}
              </p>
            ) : null}
          </div>
        )}
      </Tile>

      <Tile icon={LeafIcon} title={t("activity.sync.phase")}>
        {snap.phase ? (
          <div>
            <p className="font-mono text-2xl font-bold text-ink-50">
              {t(PHASE_KEY[snap.phase.phase] ?? "calc.goal.maintain")}
            </p>
            {snap.phase.startDate && (
              <p className="mt-1 text-sm text-ink-400">
                {t("activity.sync.since")}{" "}
                {dateFmt(locale, {
                  dateStyle: "medium",
                  timeZone: "UTC",
                }).format(new Date(`${snap.phase.startDate}T00:00:00Z`))}
              </p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-ink-400">
              {t("activity.sync.phaseNote")}
            </p>
          </div>
        ) : (
          <Empty>{t("activity.sync.noPhase")}</Empty>
        )}
      </Tile>
    </div>
  );
};
