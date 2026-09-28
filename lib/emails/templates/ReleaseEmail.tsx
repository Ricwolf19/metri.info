import { renderReleaseNotes } from "@/lib/releases/markdown";
import { createT, type Locale } from "@/lib/i18n/config";

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
  apkUrl: string;
  downloadPageUrl: string;
  // Per-recipient; `notify.ts` passes a placeholder and swaps it after render.
  unsubscribeUrl: string;
};

const noteStyles = {
  h2: `font-size:16px;font-weight:700;color:${emailTheme.text};margin:20px 0 8px`,
  h3: `font-size:14px;font-weight:700;color:${emailTheme.text};margin:16px 0 6px`,
  p: `font-size:14px;line-height:1.6;color:${emailTheme.textMuted};margin:0 0 12px`,
  ul: "margin:0 0 12px;padding-left:20px",
  li: `font-size:14px;line-height:1.6;color:${emailTheme.textMuted};margin:0 0 4px`,
  a: `color:${emailTheme.link};text-decoration:underline`,
  code: "font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px",
};

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
      <EmailHeading>{t("releaseEmail.heading", { version })}</EmailHeading>
      <EmailParagraph>{t("releaseEmail.intro")}</EmailParagraph>
      {notesHtml && (
        // Escaped + allow-listed markup only — see lib/releases/markdown.ts.
        <div dangerouslySetInnerHTML={{ __html: notesHtml }} />
      )}
      <CtaButton href={apkUrl} label={t("releaseEmail.download")} />
      <EmailParagraph muted>
        <EmailLink href={downloadPageUrl}>
          {t("releaseEmail.downloadPage")}
        </EmailLink>
      </EmailParagraph>
    </EmailShell>
  );
};
