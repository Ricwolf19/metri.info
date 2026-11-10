import { Section } from "@react-email/components";

import { createT, type Locale } from "@/lib/i18n/config";
import { renderReleaseNotes } from "@/lib/releases/markdown";

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

type ReleaseEmailProps = {
  locale: Locale;
  version: string;
  notes: string;
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

/**
 * "A new version is out": the kicker and the version each on their own line,
 * what changed in its own panel, and one button to the download page.
 *
 * Never link the APK from here. Email apps open links in an embedded browser,
 * where a file download silently does nothing; the page can tell and offer a
 * way out (see `DownloadButtons`), and it carries the install steps.
 */
export const ReleaseEmail = ({
  locale,
  version,
  notes,
  downloadPageUrl,
  unsubscribeUrl,
}: ReleaseEmailProps) => {
  const t = createT(locale);
  // No links inside the notes: the one way forward is the button below. The
  // changelog's own version heading goes too, the email already opens with it.
  const notesHtml = renderReleaseNotes(notes, noteStyles, {
    links: false,
    versionHeading: false,
  });
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
      <EmailKicker>{t("releaseEmail.badge")}</EmailKicker>
      <EmailHeading>{t("releaseEmail.heading", { version })}</EmailHeading>
      <EmailDivider />
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
          <EmailSectionLabel>{t("releaseEmail.whatsNew")}</EmailSectionLabel>
          {/* Escaped + allow-listed markup only — see lib/releases/markdown.ts. */}
          <div dangerouslySetInnerHTML={{ __html: notesHtml }} />
        </Section>
      )}

      <CtaButton
        block
        href={downloadPageUrl}
        label={t("releaseEmail.download")}
      />
    </EmailShell>
  );
};
