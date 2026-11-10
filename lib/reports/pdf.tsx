import path from "node:path";

import {
  Document,
  Font,
  G,
  Link,
  Page,
  Path,
  Polyline,
  renderToBuffer,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

import { siteLabelKey } from "@/lib/body/sites";
import { MARK_PATHS, MARK_TRANSFORM, MARK_VIEWBOX } from "@/lib/brand/mark";
import { displayLength, displayWeight, signed } from "@/lib/body/units";
import { emailTheme as c } from "@/lib/emails/templates/BaseLayout";
import { createT, type Locale, type TFunction } from "@/lib/i18n/config";
import { exerciseLabel } from "@/lib/training/exercise-names";
import { WEEKLY_SET_TARGET } from "@/lib/training/muscle-load";
import { muscleHeadKey } from "@/lib/training/muscles";

import {
  anomalyText,
  change,
  lengthUnit,
  monthLabel,
  type ReportContext,
  weightUnit,
} from "./format";
import type { MonthlyReport, MuscleRow } from "./monthly";

/**
 * The monthly report as an A4 PDF, in the same dark tokens as the emails.
 * This is the full version: absolute body numbers live here and on the body
 * page, never in the email body.
 *
 * The fonts come from the `geist` package. `outputFileTracingIncludes` in
 * `next.config.ts` ships them with the cron function; `geist` has the TTFs,
 * which the renderer needs (it can't read the WOFF2 the site serves).
 */

const fontFile = (dir: string, file: string) =>
  path.join(process.cwd(), "node_modules/geist/dist/fonts", dir, file);

Font.register({
  family: "Geist",
  fonts: [
    { src: fontFile("geist-sans", "Geist-Regular.ttf"), fontWeight: 400 },
    { src: fontFile("geist-sans", "Geist-SemiBold.ttf"), fontWeight: 600 },
    { src: fontFile("geist-sans", "Geist-Bold.ttf"), fontWeight: 700 },
  ],
});
Font.register({
  family: "GeistMono",
  fonts: [
    { src: fontFile("geist-mono", "GeistMono-Regular.ttf"), fontWeight: 400 },
    { src: fontFile("geist-mono", "GeistMono-Bold.ttf"), fontWeight: 700 },
  ],
});
// Whole words only: mid-word hyphens read as errors in numbers and names.
Font.registerHyphenationCallback((word) => [word]);

const s = StyleSheet.create({
  page: {
    backgroundColor: c.bg,
    color: c.text,
    fontFamily: "Geist",
    fontSize: 10,
    lineHeight: 1.4,
    paddingTop: 36,
    paddingHorizontal: 36,
    paddingBottom: 56,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.cardBorder,
  },
  brand: { flexDirection: "row", alignItems: "center" },
  brandName: { fontSize: 15, fontWeight: 700, marginLeft: 6 },
  kicker: {
    fontFamily: "GeistMono",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: c.accent,
    textAlign: "right",
  },
  month: { fontSize: 11, fontWeight: 600, textAlign: "right", marginTop: 2 },
  person: { fontSize: 9, color: c.textMuted, textAlign: "right", marginTop: 1 },
  verdict: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.3,
    marginTop: 18,
    marginBottom: 14,
  },
  tiles: { flexDirection: "row", marginHorizontal: -4 },
  tile: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    borderRadius: 8,
  },
  tileLabel: {
    fontFamily: "GeistMono",
    fontSize: 7,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: c.textSubtle,
  },
  tileValue: {
    fontFamily: "GeistMono",
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.3,
    marginTop: 6,
  },
  tileNote: { fontSize: 8, color: c.textMuted, marginTop: 2 },
  section: { marginTop: 18 },
  sectionTitle: {
    fontFamily: "GeistMono",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: c.textSubtle,
    marginBottom: 8,
  },
  card: {
    padding: 12,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    borderRadius: 8,
  },
  alert: {
    borderLeftWidth: 2,
    borderLeftColor: c.warn,
    paddingLeft: 10,
    marginBottom: 8,
  },
  alertTitle: { fontWeight: 600, fontSize: 10.5 },
  muted: { color: c.textMuted },
  small: { fontSize: 8.5, color: c.textMuted, marginTop: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: c.cardBorder,
  },
  rowHead: {
    fontFamily: "GeistMono",
    fontSize: 7,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: c.textSubtle,
  },
  name: { flex: 1 },
  cell: { width: 62, textAlign: "right", fontFamily: "GeistMono", fontSize: 9 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  barLabel: { width: 96, fontSize: 9, color: c.textMuted },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: c.cardBorder,
    borderRadius: 3,
  },
  barFill: { height: 6, borderRadius: 3 },
  barValue: {
    width: 44,
    textAlign: "right",
    fontFamily: "GeistMono",
    fontSize: 9,
  },
  barUsual: {
    width: 44,
    textAlign: "right",
    fontFamily: "GeistMono",
    fontSize: 8,
    color: c.textSubtle,
  },
  next: {
    padding: 12,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.accent,
    borderRadius: 8,
  },
  link: { color: c.accent, textDecoration: "none" },
  disclaimer: {
    position: "absolute",
    left: 36,
    bottom: 24,
    fontSize: 7.5,
    color: c.textSubtle,
  },
});

const Tile = ({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string | null;
}) => (
  <View style={s.tile}>
    <Text style={s.tileLabel}>{label}</Text>
    <Text style={s.tileValue}>{value}</Text>
    <Text style={s.tileNote}>{note ?? " "}</Text>
  </View>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={s.section} wrap={false}>
    <Text style={s.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const STATUS_COLOR: Record<MuscleRow["status"], string> = {
  untrained: c.cardBorder,
  low: c.textSubtle,
  optimal: c.accent,
  high: c.warn,
};

/** Keeps the block small enough to share the first page with the others. */
const MAX_MUSCLES = 8;

const MuscleBars = ({ rows, t }: { rows: MuscleRow[]; t: TFunction }) => {
  const shown = rows.slice(0, MAX_MUSCLES);
  const top = Math.max(
    WEEKLY_SET_TARGET.max,
    ...shown.map((m) => m.setsPerWeek),
  );
  return (
    <View style={s.card}>
      <View style={[s.barRow, { marginBottom: 7 }]}>
        <Text style={[s.rowHead, { width: 96 }]}>
          {t("monthlyReport.pdf.muscle")}
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={[s.rowHead, { width: 44, textAlign: "right" }]}>
          {t("monthlyReport.pdf.perWeek")}
        </Text>
        <Text style={[s.rowHead, { width: 44, textAlign: "right" }]}>
          {t("monthlyReport.pdf.usual")}
        </Text>
      </View>
      {shown.map((m) => (
        <View key={m.head} style={s.barRow}>
          <Text style={s.barLabel}>{t(muscleHeadKey(m.head))}</Text>
          <View style={s.barTrack}>
            <View
              style={[
                s.barFill,
                {
                  width: `${Math.min(100, (m.setsPerWeek / top) * 100)}%`,
                  backgroundColor: STATUS_COLOR[m.status],
                },
              ]}
            />
          </View>
          <Text style={s.barValue}>{m.setsPerWeek}</Text>
          <Text style={s.barUsual}>{m.usualPerWeek ?? "-"}</Text>
        </View>
      ))}
      <Text style={s.small}>
        {t("monthlyReport.pdf.muscleLegend", {
          min: WEEKLY_SET_TARGET.min,
          max: WEEKLY_SET_TARGET.max,
        })}
      </Text>
    </View>
  );
};

const CHART_W = 499;
const CHART_H = 64;
const CHART_PAD = 6;

const WeightChart = ({ values }: { values: (number | null)[] }) => {
  const known = values.filter((v): v is number => v !== null);
  if (known.length < 2) return null;
  const min = Math.min(...known);
  const span = Math.max(Math.max(...known) - min, 0.5);
  const step = (CHART_W - CHART_PAD * 2) / Math.max(values.length - 1, 1);
  const points = values
    .map((v, i) =>
      v === null
        ? null
        : `${CHART_PAD + i * step},${
            CHART_H - CHART_PAD - ((v - min) / span) * (CHART_H - CHART_PAD * 2)
          }`,
    )
    .filter((p): p is string => p !== null)
    .join(" ");
  return (
    <Svg
      width={CHART_W}
      height={CHART_H}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      style={{ marginBottom: 8 }}
    >
      <Polyline points={points} stroke={c.accent} strokeWidth={2} fill="none" />
    </Svg>
  );
};

type MonthlyReportPdfProps = {
  locale: Locale;
  report: MonthlyReport;
  name: string;
  imperial: boolean;
  customNames: Record<string, string>;
  guideUrl: string;
};

const MonthlyReportPdf = ({
  locale,
  report,
  name,
  imperial,
  customNames,
  guideUrl,
}: MonthlyReportPdfProps) => {
  const t = createT(locale);
  const context: ReportContext = { t, locale, imperial, customNames };
  const month = monthLabel(report.period, locale);
  const { training, strength, body, nutrition } = report;
  const weight = (kg: number) => displayWeight(kg, imperial);
  const wUnit = weightUnit(imperial);
  const lUnit = lengthUnit(imperial);
  const versus = (current: number, previous: number | null) =>
    previous === null
      ? null
      : t("monthlyReport.pdf.vsLast", { delta: change(current, previous) });
  const lastWeek = body?.endKg ?? null;

  return (
    <Document
      title={`${t("monthlyReport.kicker")} · ${month}`}
      author="Metri"
      creator="Metri"
      producer="Metri"
      language={locale}
    >
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.brand}>
            <Svg width={30} height={30} viewBox={MARK_VIEWBOX}>
              <G transform={MARK_TRANSFORM}>
                {MARK_PATHS.map((d) => (
                  <Path key={d} d={d} fill={c.accent} />
                ))}
              </G>
            </Svg>
            <Text style={s.brandName}>Metri</Text>
          </View>
          <View>
            <Text style={s.kicker}>{t("monthlyReport.kicker")}</Text>
            <Text style={s.month}>{month}</Text>
            <Text style={s.person}>{name}</Text>
          </View>
        </View>

        <Text style={s.verdict}>
          {t(`monthlyReport.verdict.${report.verdict}`)}
        </Text>

        <View style={s.tiles}>
          <Tile
            label={t("monthlyReport.stat.sessions")}
            value={String(training.sessions)}
            note={versus(training.sessions, training.prevSessions)}
          />
          <Tile
            label={t("monthlyReport.stat.sets")}
            value={String(training.workingSets)}
            note={versus(training.workingSets, training.prevWorkingSets)}
          />
          <Tile
            label={t("monthlyReport.pdf.weight")}
            value={lastWeek === null ? "-" : `${weight(lastWeek)}`}
            note={
              body?.deltaKg != null
                ? `${signed(weight(body.deltaKg))} ${wUnit}`
                : wUnit
            }
          />
          <Tile
            label={t("monthlyReport.stat.protein")}
            value={
              nutrition?.avgProteinG != null ? `${nutrition.avgProteinG}` : "-"
            }
            note={
              nutrition?.targetProteinG
                ? t("monthlyReport.pdf.target", {
                    value: `${Math.round(nutrition.targetProteinG)} g`,
                  })
                : "g"
            }
          />
        </View>

        {report.anomalies.length > 0 && (
          <Section title={t("monthlyReport.attention")}>
            {report.anomalies.map((anomaly) => {
              const { title, body: detail } = anomalyText(anomaly, context);
              return (
                <View key={anomaly.id} style={s.alert}>
                  <Text style={s.alertTitle}>{title}</Text>
                  <Text style={s.muted}>{detail}</Text>
                </View>
              );
            })}
          </Section>
        )}

        {training.sessions > 0 && (
          <Section title={t("monthlyReport.pdf.training")}>
            <View style={s.tiles}>
              <Tile
                label={t("monthlyReport.pdf.perWeekLong")}
                value={String(training.perWeek)}
                note={t("monthlyReport.pdf.sessionsUnit")}
              />
              <Tile
                label={t("monthlyReport.pdf.timeTrained")}
                value={String(Math.round(training.minutes / 60))}
                note={t("monthlyReport.pdf.hoursUnit")}
              />
              <Tile
                label={t("monthlyReport.pdf.skipped")}
                value={String(training.skippedDays)}
                note={t("monthlyReport.pdf.daysUnit")}
              />
              <Tile
                label={t("monthlyReport.pdf.longestBreak")}
                value={String(training.longestGapDays ?? 0)}
                note={t("monthlyReport.pdf.daysUnit")}
              />
            </View>
          </Section>
        )}

        {training.sessions > 0 && (
          <Section title={t("monthlyReport.pdf.strength")}>
            <View style={s.card}>
              {strength.gains.length === 0 ? (
                <Text style={s.muted}>{t("monthlyReport.pdf.noLifts")}</Text>
              ) : (
                <>
                  <View style={[s.row, { paddingTop: 0 }]}>
                    <Text style={[s.rowHead, s.name]}>
                      {t("monthlyReport.pdf.exercise")}
                    </Text>
                    <Text
                      style={[s.rowHead, { width: 62, textAlign: "right" }]}
                    >
                      {t("monthlyReport.pdf.before")}
                    </Text>
                    <Text
                      style={[s.rowHead, { width: 62, textAlign: "right" }]}
                    >
                      {t("monthlyReport.pdf.now")}
                    </Text>
                    <Text
                      style={[s.rowHead, { width: 62, textAlign: "right" }]}
                    >
                      {t("monthlyReport.pdf.change")}
                    </Text>
                  </View>
                  {strength.gains.map((g) => (
                    <View key={g.exerciseId} style={s.row}>
                      <Text style={s.name}>
                        {exerciseLabel(g.exerciseId, locale, customNames)}
                      </Text>
                      <Text style={s.cell}>
                        {weight(g.fromKg)} {wUnit}
                      </Text>
                      <Text style={s.cell}>
                        {weight(g.toKg)} {wUnit}
                      </Text>
                      <Text style={[s.cell, { color: c.accent }]}>
                        {signed(g.pct)}%
                      </Text>
                    </View>
                  ))}
                </>
              )}
              {strength.stalled.length > 0 && (
                <Text style={s.small}>
                  {t("monthlyReport.pdf.stalled", {
                    names: strength.stalled
                      .map((g) =>
                        exerciseLabel(g.exerciseId, locale, customNames),
                      )
                      .join(", "),
                  })}
                </Text>
              )}
              <Text style={s.small}>{t("monthlyReport.pdf.e1rmNote")}</Text>
            </View>
          </Section>
        )}

        {report.muscles.length > 0 && (
          <Section title={t("monthlyReport.pdf.muscles")}>
            <MuscleBars rows={report.muscles} t={t} />
          </Section>
        )}

        {body && (
          <Section title={t("monthlyReport.pdf.body")}>
            <View style={s.card}>
              <WeightChart values={body.weeks.map((w) => w.avgKg)} />
              {body.startKg !== null && body.endKg !== null && (
                <Text>
                  {t("monthlyReport.pdf.weightRange", {
                    start: `${weight(body.startKg)} ${wUnit}`,
                    end: `${weight(body.endKg)} ${wUnit}`,
                  })}
                  {body.weeklyRatePct !== null
                    ? ` ${t("monthlyReport.pdf.weightRate", {
                        rate: signed(body.weeklyRatePct),
                      })}`
                    : ""}
                </Text>
              )}
              {body.keySiteDeltaCm !== null && (
                <Text style={s.muted}>
                  {t(siteLabelKey(body.keySite))}:{" "}
                  {signed(displayLength(body.keySiteDeltaCm, imperial))} {lUnit}
                </Text>
              )}
              <Text style={s.small}>
                {t("monthlyReport.pdf.weighIns", { count: body.weighIns })}
                {body.excludedWeighIns > 0
                  ? ` ${t("monthlyReport.pdf.excluded", {
                      count: body.excludedWeighIns,
                    })}`
                  : ""}
              </Text>
            </View>
          </Section>
        )}

        {nutrition && (
          <Section title={t("monthlyReport.pdf.nutrition")}>
            <View style={s.card}>
              <Text>
                {t("monthlyReport.pdf.daysLogged", {
                  count: nutrition.daysLogged,
                  total: report.daysInMonth,
                })}
              </Text>
              {nutrition.reliable ? (
                <Text style={s.muted}>
                  {t("monthlyReport.pdf.averages", {
                    kcal: nutrition.avgKcal ?? 0,
                    protein: nutrition.avgProteinG ?? 0,
                  })}
                  {nutrition.targetKcal
                    ? ` ${t("monthlyReport.pdf.kcalTarget", {
                        kcal: Math.round(nutrition.targetKcal),
                      })}`
                    : ""}
                </Text>
              ) : (
                <Text style={s.small}>{t("monthlyReport.pdf.unreliable")}</Text>
              )}
            </View>
          </Section>
        )}

        <Section title={t("monthlyReport.nextStep")}>
          <View style={s.next}>
            <Text>{t(`monthlyReport.step.${report.nextStep}`)}</Text>
            <Link src={guideUrl} style={[s.link, { marginTop: 4 }]}>
              {t("monthlyReport.readGuide")}
            </Link>
          </View>
        </Section>

        <Text style={s.disclaimer} fixed>
          {t("monthlyReport.pdf.disclaimer")}
        </Text>
      </Page>
    </Document>
  );
};

export const renderMonthlyReportPdf = (
  props: MonthlyReportPdfProps,
): Promise<Buffer> => renderToBuffer(MonthlyReportPdf(props));
