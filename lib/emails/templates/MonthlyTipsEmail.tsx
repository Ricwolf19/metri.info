import { Section, Text } from "@react-email/components";

import { CALC_CONTENT } from "@/lib/calculators/content";
import { createT, type Locale, type TFunction } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { AREA_KEY } from "@/lib/quiz/areas";
import { monthLabel } from "@/lib/reports/format";
import type { TipsEdition } from "@/lib/reports/tips";
import { absoluteUrl } from "@/lib/utils";

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
} from "./BaseLayout";

type MonthlyTipsEmailProps = {
  locale: Locale;
  period: string;
  edition: TipsEdition;
  // Per-recipient; the sender renders with its real value.
  unsubscribeUrl: string;
};

const titleStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: emailTheme.text,
  margin: "0 0 2px",
};

const bodyStyle = {
  fontSize: 14,
  lineHeight: 1.5,
  color: emailTheme.textMuted,
  margin: "0 0 14px",
};

const guideUrl = (slug: string, locale: Locale) =>
  absoluteUrl(`${routePath("docs", locale)}/${slug}`);

const activityLine = (
  edition: TipsEdition,
  month: string,
  locale: Locale,
  t: TFunction,
): string | null => {
  if (edition.calculations === 0) return null;
  const saved =
    edition.calculations === 1
      ? t("monthlyTips.savedOne", { month })
      : t("monthlyTips.savedMany", { month, count: edition.calculations });
  return edition.topCalculator
    ? `${saved} ${t("monthlyTips.mostUsed", {
        name: CALC_CONTENT[edition.topCalculator][locale].h1,
      })}`
    : saved;
};

/**
 * What the monthly email becomes when there is nothing to report on: an
 * account that hasn't used the app yet, a free account, or a quiet month.
 * Never an empty report: three rotating tips, a recommendation drawn from
 * what the account has done on the site, and what's current in Metri.
 */
export const MonthlyTipsEmail = ({
  locale,
  period,
  edition,
  unsubscribeUrl,
}: MonthlyTipsEmailProps) => {
  const t = createT(locale);
  const month = monthLabel(period, locale);
  const quiet = edition.reason === "quiet_month";
  const activity = activityLine(edition, month, locale, t);
  const calculator = CALC_CONTENT[edition.calculator][locale].h1;

  return (
    <EmailShell
      lang={locale}
      preview={t("monthlyTips.preview")}
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
      <EmailKicker>{t("monthlyTips.kicker")}</EmailKicker>
      <EmailHeading>
        {quiet ? t("monthlyTips.headingQuiet") : t("monthlyTips.heading")}
      </EmailHeading>
      <EmailDivider />
      <EmailParagraph>
        {quiet
          ? t("monthlyTips.introQuiet", { month })
          : t("monthlyTips.intro")}
      </EmailParagraph>
      {activity && <EmailParagraph muted>{activity}</EmailParagraph>}

      <EmailSectionLabel>{t("monthlyTips.tipsLabel")}</EmailSectionLabel>
      {edition.tips.map((tip) => (
        <Section key={tip.guide}>
          <Text style={titleStyle}>{t(tip.title)}</Text>
          <Text style={bodyStyle}>
            {t(tip.body)}{" "}
            <EmailLink href={guideUrl(tip.guide, locale)}>
              {t("monthlyReport.readGuide")}
            </EmailLink>
          </Text>
        </Section>
      ))}

      <EmailSectionLabel>{t("monthlyTips.recommendedLabel")}</EmailSectionLabel>
      {edition.knowledge?.kind === "take" && (
        <Text style={bodyStyle}>
          {t("monthlyTips.takeQuiz")}{" "}
          <EmailLink href={absoluteUrl(routePath("quiz", locale))}>
            {t("quiz.heroCta")}
          </EmailLink>
        </Text>
      )}
      {edition.knowledge?.kind === "study" && (
        <Text style={bodyStyle}>
          {t("monthlyTips.studyArea", {
            area: t(AREA_KEY[edition.knowledge.area]),
          })}{" "}
          <EmailLink href={guideUrl(edition.knowledge.guide, locale)}>
            {t("monthlyReport.readGuide")}
          </EmailLink>
        </Text>
      )}
      <Text style={bodyStyle}>
        {t("monthlyTips.tryCalculator", { name: calculator })}{" "}
        <EmailLink href={absoluteUrl(routePath(edition.calculator, locale))}>
          {t("monthlyTips.openCalculator")}
        </EmailLink>
      </Text>

      {edition.latestVersion && (
        <>
          <EmailSectionLabel>{t("monthlyTips.newsLabel")}</EmailSectionLabel>
          <Text style={bodyStyle}>
            {quiet
              ? t("monthlyTips.newsQuiet", { version: edition.latestVersion })
              : t("monthlyTips.news", { version: edition.latestVersion })}
          </Text>
        </>
      )}

      {quiet ? (
        <CtaButton
          block
          href={absoluteUrl(routePath("body", locale))}
          label={t("monthlyReport.cta")}
        />
      ) : (
        <CtaButton
          block
          href={absoluteUrl(routePath("download", locale))}
          label={t("monthlyTips.ctaApp")}
        />
      )}
    </EmailShell>
  );
};
