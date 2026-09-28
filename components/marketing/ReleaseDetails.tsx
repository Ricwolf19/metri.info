import { createT, type Locale } from "@/lib/i18n/config";
import type { AppRelease } from "@/lib/releases/types";

const formatDate = (iso: string, locale: Locale): string =>
  new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(iso));

const formatMb = (bytes: number): string => (bytes / 1024 / 1024).toFixed(1);

/** Version, date, size and checksum of the APK the button links — so a
 * sideloader can tell which build they got and verify it arrived intact. */
export const ReleaseDetails = ({
  release,
  locale,
}: {
  release: AppRelease;
  locale: Locale;
}) => {
  const t = createT(locale);
  return (
    <div className="mt-6 max-w-xl rounded-card border border-ink-600 bg-ink-850/60 p-5 text-sm">
      <h2 className="text-xs font-semibold tracking-wider text-ink-400 uppercase">
        {t("download.releaseTitle")}
      </h2>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-ink-200">
        <span className="font-semibold text-ink-50">
          {t("download.version", { version: release.version })}
        </span>
        <span>
          {t("download.releasedOn", {
            date: formatDate(release.publishedAt, locale),
          })}
        </span>
        <span>
          {t("download.sizeMb", { size: formatMb(release.sizeBytes) })}
        </span>
        <a
          href={release.releaseUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-accent underline-offset-4 hover:underline"
        >
          {t("download.releaseNotes")}
        </a>
      </p>
      <p className="mt-4 text-xs font-semibold text-ink-400">
        {t("download.checksum")}
      </p>
      <code className="mt-1 block font-mono text-xs break-all text-ink-300 select-all">
        {release.sha256}
      </code>
      <p className="mt-2 text-xs text-ink-400">{t("download.checksumHint")}</p>
    </div>
  );
};
