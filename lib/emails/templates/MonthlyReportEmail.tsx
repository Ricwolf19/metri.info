import { Column, Row, Section, Text } from "@react-email/components";

import { siteLabelKey } from "@/lib/body/sites";
import { displayLength, displayWeight, signed } from "@/lib/body/units";
import { createT, type Locale } from "@/lib/i18n/config";
import {
  anomalyText,
  change,
  lengthUnit,
  monthLabel,
  type ReportContext,
  weightUnit,
} from "@/lib/reports/format";
import type { MonthlyReport } from "@/lib/reports/monthly";

import {
  CtaButton,
  EmailDivider,
  EmailHeading,
  EmailKicker,
  EmailLink,
  EmailParagraph,
  EmailSectionLabel,
  EmailShell,
  emailTheme,
  MONO_FONT,
} from "./BaseLayout";

type MonthlyReportEmailProps = {
  locale: Locale;
  report: MonthlyReport;
  imperial: boolean;
  customNames: Record<string, string>;
  bodyUrl: string;
  guideUrl: string;
  // Per-recipient; the sender renders with its real value.
  unsubscribeUrl: string;
};

/** The inbox shows only the two that matter most; the PDF has the rest. */
const MAX_ANOMALIES = 2;

const StatRow = ({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string | null;
}) => (
  <Row style={{ borderBottom: `1px solid ${emailTheme.cardBorder}` }}>
    <Column
      style={{
        padding: "10px 0",
        fontSize: 14,
        color: emailTheme.textMuted,
      }}
    >
      {label}
    </Column>
    <Column
      align="right"
      style={{
        padding: "10px 0",
        fontFamily: MONO_FONT,
        fontSize: 15,
        fontWeight: 700,
        color: emailTheme.text,
        whiteSpace: "nowrap",
      }}
    >
      {value}
      {note && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: emailTheme.textSubtle,
            marginLeft: 6,
          }}
        >
          {note}
        </span>
      )}
    </Column>
  </Row>
);

const delta = (current: number, previous: number | null) =>
  previous === null ? null : change(current, previous);

/**
 * The month in the inbox: a verdict, the few numbers that matter and what to
 * do next. Body measurements appear only as changes here, never as absolute
 * values, since an inbox is less private than an account; the attached PDF
 * and the body page have the full picture.
 */
export const MonthlyReportEmail = ({
  locale,
  report,
  imperial,
  customNames,
  bodyUrl,
  guideUrl,
  unsubscribeUrl,
}: MonthlyReportEmailProps) => {
  const t = createT(locale);
  const context: ReportContext = { t, locale, imperial, customNames };
  const month = monthLabel(report.period, locale);
  const { training, body, nutrition } = report;
  const anomalies = report.anomalies.slice(0, MAX_ANOMALIES);
  const verdict = t(`monthlyReport.verdict.${report.verdict}`);

  return (
    <EmailShell
      lang={locale}
      preview={verdict}
      tagline={t("releaseEmail.tagline")}
      footerNote={
        <>
          {t("monthlyReport.footer")}{" "}
          <EmailLink href={unsubscribeUrl}>
            {t("monthlyReport.unsubscribe")}
          </EmailLink>
        </>
      }
    >
      <EmailKicker>{t("monthlyReport.kicker")}</EmailKicker>
      <EmailHeading>{month}</EmailHeading>
      <EmailDivider />
      <EmailParagraph>{verdict}</EmailParagraph>

      <Section>
        {training.sessions > 0 && (
          <StatRow
            label={t("monthlyReport.stat.sessions")}
            value={String(training.sessions)}
            note={delta(training.sessions, training.prevSessions)}
          />
        )}
        {training.workingSets > 0 && (
          <StatRow
            label={t("monthlyReport.stat.sets")}
            value={String(training.workingSets)}
            note={delta(training.workingSets, training.prevWorkingSets)}
          />
        )}
        {body?.deltaKg != null && (
          <StatRow
            label={t("monthlyReport.stat.weightChange")}
            value={`${signed(displayWeight(body.deltaKg, imperial))} ${weightUnit(imperial)}`}
          />
        )}
        {body?.keySiteDeltaCm != null && (
          <StatRow
            label={t(siteLabelKey(body.keySite))}
            value={`${signed(displayLength(body.keySiteDeltaCm, imperial))} ${lengthUnit(imperial)}`}
          />
        )}
        {nutrition?.avgProteinG != null && (
          <StatRow
            label={t("monthlyReport.stat.protein")}
            value={`${nutrition.avgProteinG} g`}
            note={
              nutrition.targetProteinG
                ? `/ ${Math.round(nutrition.targetProteinG)} g`
                : null
            }
          />
        )}
      </Section>

      {anomalies.length > 0 && (
        <>
          <EmailSectionLabel>{t("monthlyReport.attention")}</EmailSectionLabel>
          {anomalies.map((anomaly) => {
            const { title, body: detail } = anomalyText(anomaly, context);
            return (
              <Section
                key={anomaly.id}
                style={{
                  borderLeft: `3px solid ${emailTheme.warn}`,
                  padding: "0 0 0 12px",
                  margin: "0 0 12px",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: emailTheme.text,
                    margin: "0 0 2px",
                  }}
                >
                  {title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: emailTheme.textMuted,
                    margin: 0,
                  }}
                >
                  {detail}
                </Text>
              </Section>
            );
          })}
        </>
      )}

      <EmailSectionLabel>{t("monthlyReport.nextStep")}</EmailSectionLabel>
      <EmailParagraph>
        {t(`monthlyReport.step.${report.nextStep}`)}{" "}
        <EmailLink href={guideUrl}>{t("monthlyReport.readGuide")}</EmailLink>
      </EmailParagraph>

      <CtaButton block href={bodyUrl} label={t("monthlyReport.cta")} />
      <Text
        style={{
          fontSize: 13,
          color: emailTheme.textSubtle,
          textAlign: "center",
          margin: "12px 0 0",
        }}
      >
        {t("monthlyReport.pdfNote")}
      </Text>
    </EmailShell>
  );
};
