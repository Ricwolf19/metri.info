import { Section, Text } from "@react-email/components";

import { createT, type Locale } from "@/lib/i18n/config";
import { renderReleaseNotes } from "@/lib/releases/markdown";

import {
  CtaButton,
  EmailHeading,
  EmailLink,
  EmailParagraph,
  EmailShell,
  emailTheme,
} from "./BaseLayout";

type ReleaseEmailProps = {
  locale: Locale;
  version: string;
  notes: string;
  /** Our own APK endpoint (served with the Android package type). */
  apkUrl: string;
  downloadPageUrl: string;
  // Per-recipient; `notify.ts` passes a placeholder and swaps it after render.
  unsubscribeUrl: string;
};

const noteStyles = {
  h2: `font-size:14px;font-weight:700;color:${emailTheme.text};margin:16px 0 6px`,
  h3: `font-size:13px;font-weight:700;color:${emailTheme.text};margin:14px 0 4px`,
  p: `font-size:14px;line-height:1.6;color:${emailTheme.textMuted};margin:0 0 10px`,
  ul: "margin:0 0 10px;padding-left:18px",
  li: `font-size:14px;line-height:1.6;color:${emailTheme.textMuted};margin:0 0 4px`,
  a: `color:${emailTheme.link};text-decoration:underline`,
  code: "font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px",
};

const monoLabel = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 999,
  border: `1px solid ${emailTheme.cardBorder}`,
  backgroundColor: emailTheme.bg,
  color: emailTheme.accent,
  fontFamily: "ui-monospace, Menlo, Consolas, monospace",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  margin: "0 0 14px",
};

const stepStyle = {
  fontSize: 13,
  lineHeight: 1.6,
  color: emailTheme.textMuted,
  margin: "0 0 6px",
};

/**
 * "A new version is out" — the version as a badge, what changed inside its
 * own panel, one lime button for the APK and a quiet link to the download
 * page, then the three install steps in short form. Same tokens as the site.
 */
export const ReleaseEmail = ({
  locale,
  version,
  notes,
  apkUrl,
  downloadPageUrl,
  unsubscribeUrl,
}: ReleaseEmailProps) => {
  const t = createT(locale);
  const notesHtml = renderReleaseNotes(notes, noteStyles);
  return (
    <EmailShell
      lang={locale}
      preview={t("releaseEmail.preview", { version })}
      tagline={t("releaseEmail.tagline")}
      footerNote={
        <>
          {t("releaseEmail.footer")}{" "}
          <EmailLink href={unsubscribeUrl}>
            {t("releaseEmail.unsubscribe")}
          </EmailLink>
        </>
      }
    >
      <Text style={monoLabel}>
        {t("releaseEmail.badge")} · v{version}
      </Text>
      <EmailHeading>{t("releaseEmail.heading", { version })}</EmailHeading>
      <EmailParagraph>{t("releaseEmail.intro")}</EmailParagraph>

      {notesHtml && (
        <Section
          style={{
            backgroundColor: emailTheme.bg,
            border: `1px solid ${emailTheme.cardBorder}`,
            borderRadius: 10,
            padding: "4px 18px 8px",
            margin: "0 0 8px",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: emailTheme.textSubtle,
              fontFamily: "ui-monospace, Menlo, Consolas, monospace",
              margin: "12px 0 0",
            }}
          >
            {t("releaseEmail.whatsNew")}
          </Text>
          {/* Escaped + allow-listed markup only — see lib/releases/markdown.ts. */}
          <div dangerouslySetInnerHTML={{ __html: notesHtml }} />
        </Section>
      )}

      <CtaButton href={apkUrl} label={t("releaseEmail.download")} />
      <Text
        style={{
          fontSize: 13,
          color: emailTheme.textSubtle,
          textAlign: "center",
          margin: "0 0 20px",
        }}
      >
        <EmailLink href={downloadPageUrl}>
          {t("releaseEmail.downloadPage")}
        </EmailLink>
      </Text>

      <Section
        style={{
          borderTop: `1px solid ${emailTheme.cardBorder}`,
          paddingTop: 16,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: emailTheme.textSubtle,
            fontFamily: "ui-monospace, Menlo, Consolas, monospace",
            margin: "0 0 8px",
          }}
        >
          {t("releaseEmail.installTitle")}
        </Text>
        <Text style={stepStyle}>1. {t("releaseEmail.step1")}</Text>
        <Text style={stepStyle}>2. {t("releaseEmail.step2")}</Text>
        <Text style={stepStyle}>3. {t("releaseEmail.step3")}</Text>
      </Section>
    </EmailShell>
  );
};
