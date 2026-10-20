"use client";

import { useState } from "react";

import type { Figure } from "@/lib/body/figure";
import {
  balanceFill,
  BRAND,
  fatigueFill,
  headFills,
  headsForRegion,
  HIDDEN_REGIONS,
  MAP_VIEWS,
  type MapView,
  OUTLINE,
  recencyFill,
  regionFills,
  UNTRAINED_FILL,
} from "@/lib/body/map";
import {
  BODY_WINDOWS,
  type BodyWindow,
  type WindowLoads,
} from "@/lib/body/windows";
import { Segmented } from "@/components/ui/segmented";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { exerciseLabel } from "@/lib/training/exercise-names";
import { WEEKLY_SET_TARGET } from "@/lib/training/muscle-load";
import { muscleHeadKey } from "@/lib/training/muscles";
import { cn } from "@/lib/utils";

type Side = "front" | "back";

const WINDOW_KEY: Record<BodyWindow, TranslationKey> = {
  7: "body.window.7",
  30: "body.window.30",
  90: "body.window.90",
};
const VIEW_KEY: Record<MapView, TranslationKey> = {
  balance: "body.view.balance",
  fatigue: "body.view.fatigue",
  strength: "body.view.strength",
};
const VIEW_HINT: Record<MapView, TranslationKey> = {
  balance: "body.balanceHint",
  fatigue: "body.fatigueHint",
  strength: "body.strengthHint",
};

const Dot = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-400">
    <span
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
    {label}
  </span>
);

/**
 * The muscle map: the app's figure painted by balance, fatigue or recency
 * for one of three windows, with a legend (the fills differ in hue AND
 * density, and the labels are what make either readable) and a drilldown
 * per region. All the numbers arrive computed; this only chooses what to
 * show. Window, view and side are local: the page already carries every
 * window, so switching never round-trips.
 */
export const BodyMap = ({
  figures,
  muscles,
  initialWindow,
  customNames,
}: {
  figures: Record<Side, Figure>;
  muscles: Record<BodyWindow, WindowLoads>;
  initialWindow: BodyWindow;
  customNames: Record<string, string>;
}) => {
  const { t, locale } = useI18n();
  const [days, setDays] = useState<BodyWindow>(initialWindow);
  const [view, setView] = useState<MapView>("balance");
  const [side, setSide] = useState<Side>("front");
  const [region, setRegion] = useState<string | null>(null);

  const data = muscles[days];
  const fills = headFills(view, data.loads);
  const byRegion = regionFills(fills);
  const figure = figures[side];
  const heads = region ? headsForRegion(region) : [];

  const exerciseName = (id: string) => exerciseLabel(id, locale, customNames);

  const legend =
    view === "balance"
      ? [
          { color: UNTRAINED_FILL, key: "body.legend.untrained" as const },
          { color: balanceFill("low"), key: "body.legend.low" as const },
          {
            color: balanceFill("optimal"),
            key: "body.legend.optimal" as const,
          },
          { color: balanceFill("high"), key: "body.legend.high" as const },
        ]
      : view === "fatigue"
        ? [
            { color: UNTRAINED_FILL, key: "body.legend.fresh" as const },
            { color: fatigueFill(1), key: "body.legend.fatigued" as const },
          ]
        : [
            { color: recencyFill(0), key: "body.legend.recent" as const },
            { color: recencyFill(99), key: "body.legend.detrained" as const },
          ];

  return (
    <div className="rounded-card border border-ink-600 bg-ink-800 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Segmented
          size="sm"
          value={String(days)}
          onValueChange={(v) => setDays(Number(v) as BodyWindow)}
          options={BODY_WINDOWS.map((w) => ({
            value: String(w),
            label: t(WINDOW_KEY[w]),
          }))}
          aria-label={t("body.pickWindow")}
        />
        <Segmented
          size="sm"
          value={view}
          onValueChange={setView}
          options={MAP_VIEWS.map((v) => ({ value: v, label: t(VIEW_KEY[v]) }))}
          aria-label={t("body.pickView")}
        />
        <Segmented
          size="sm"
          value={side}
          onValueChange={setSide}
          className="ml-auto"
          options={[
            { value: "front", label: t("body.side.front") },
            { value: "back", label: t("body.side.back") },
          ]}
          aria-label={t("body.pickSide")}
        />
      </div>

      <p className="mt-3 text-xs text-ink-400">
        {view === "balance"
          ? t(VIEW_HINT.balance, {
              min: WEEKLY_SET_TARGET.min,
              max: WEEKLY_SET_TARGET.max,
            })
          : t(VIEW_HINT[view])}
      </p>

      <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-3">
          <svg
            viewBox={figure.viewBox}
            className="h-[26rem] w-auto max-w-full"
            role="img"
            aria-label={t("body.sectionMap")}
          >
            {figure.regions
              .filter((r) => !HIDDEN_REGIONS.includes(r.slug))
              .map((r) => {
                const selected = r.slug === region;
                return (
                  <g
                    key={r.slug}
                    onClick={() => setRegion(selected ? null : r.slug)}
                    className="cursor-pointer transition-opacity hover:opacity-90"
                    fill={byRegion[r.slug] ?? UNTRAINED_FILL}
                    stroke={selected ? BRAND : OUTLINE}
                    strokeWidth={selected ? 6 : 2}
                  >
                    <title>
                      {headsForRegion(r.slug)
                        .map((h) => t(muscleHeadKey(h)))
                        .join(" · ")}
                    </title>
                    {r.d.map((d, i) => (
                      <path key={i} d={d} />
                    ))}
                  </g>
                );
              })}
          </svg>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {legend.map((e) => (
              <Dot key={e.key} color={e.color} label={t(e.key)} />
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-field border border-ink-600/70 bg-ink-900/40 px-4 py-3">
              <dt className="font-mono text-[11px] tracking-wide text-ink-400 uppercase">
                {t("body.sessions")}
              </dt>
              <dd className="mt-1 font-mono text-2xl font-bold text-ink-50 tabular-nums">
                {data.sessions}
              </dd>
            </div>
            <div className="rounded-field border border-ink-600/70 bg-ink-900/40 px-4 py-3">
              <dt className="font-mono text-[11px] tracking-wide text-ink-400 uppercase">
                {t("body.sets")}
              </dt>
              <dd className="mt-1 font-mono text-2xl font-bold text-ink-50 tabular-nums">
                {data.sets}
              </dd>
            </div>
          </dl>

          {data.sets === 0 ? (
            <p className="mt-4 text-sm text-ink-400">{t("body.noSets")}</p>
          ) : null}

          <div className="mt-5">
            <p className="font-mono text-[11px] font-medium tracking-widest text-ink-400 uppercase">
              {t("body.muscleDetail")}
            </p>
            {heads.length === 0 ? (
              <p className="mt-2 text-sm text-ink-400">
                {t("body.sectionMapHint")}
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-ink-700">
                {heads.map((head) => {
                  const b = data.loads.balance.find((x) => x.head === head);
                  const f = data.loads.fatigue.find((x) => x.head === head);
                  const s = data.loads.strength.find((x) => x.head === head);
                  const top = data.topByHead[head] ?? [];
                  return (
                    <li key={head} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: fills[head].color }}
                        />
                        <span className="flex-1 text-sm font-semibold text-ink-50">
                          {t(muscleHeadKey(head))}
                        </span>
                        <span
                          className={cn(
                            "font-mono text-xs tabular-nums",
                            b?.status === "optimal"
                              ? "text-brand"
                              : "text-ink-300",
                          )}
                        >
                          {t("body.setsPerWeek", { n: b?.sets ?? 0 })}
                        </span>
                      </div>
                      <p className="mt-1 pl-6 font-mono text-[11px] text-ink-400">
                        {s?.daysSince == null
                          ? t("body.never")
                          : s.daysSince === 0
                            ? t("body.today")
                            : t("body.daysAgo", { n: s.daysSince })}
                        {s?.bestE1rmKg != null
                          ? ` · ${t("body.e1rm")} ${s.bestE1rmKg} kg`
                          : ""}
                        {f && f.index > 0
                          ? ` · ${t("body.view.fatigue").toLowerCase()} ${Math.round(f.index * 100)}%`
                          : ""}
                      </p>
                      {top.length > 0 && (
                        <ul className="mt-1.5 flex flex-wrap gap-1.5 pl-6">
                          {top.map((e) => (
                            <li
                              key={e.id}
                              className="rounded-full border border-ink-600 px-2 py-0.5 text-[11px] text-ink-200"
                            >
                              {exerciseName(e.id)}{" "}
                              <span className="font-mono text-ink-500">
                                {e.sets}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
