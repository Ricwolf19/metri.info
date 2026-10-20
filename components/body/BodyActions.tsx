"use client";

import { DownloadIcon, PrinterIcon } from "@/components/icons";
import { ShareResultDialog } from "@/components/shared/ShareResultDialog";
import { track } from "@/lib/analytics/track";
import { useI18n } from "@/lib/i18n";

const chip =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-ink-600 px-3 py-2 text-xs font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50";

/**
 * Share and export for the body page. The share card is the `/og/body` image
 * built from `token` (numbers only, no account); CSV and Excel stream from
 * the export route; PDF is the browser's print, which the page's print
 * stylesheet turns into a clean report.
 */
export const BodyActions = ({
  token,
  exportPath,
}: {
  token: string;
  exportPath: string;
}) => {
  const { t, locale } = useI18n();
  const links = () => {
    const url = `${window.location.origin}/og/body?c=${token}&locale=${locale}`;
    return { url, imageUrl: url };
  };
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 print:hidden">
      <ShareResultDialog
        analyticsId="body"
        fileName="metri-body-map.png"
        triggerLabel={t("body.share")}
        title={t("body.shareTitle")}
        description={t("body.shareDesc")}
        links={links}
      />
      <span className="mx-1 hidden h-5 w-px bg-ink-700 sm:block" aria-hidden />
      <a
        href={`${exportPath}?format=csv`}
        className={chip}
        onClick={() => track("body_export", { format: "csv" })}
      >
        <DownloadIcon size={14} />
        {t("body.exportCsv")}
      </a>
      <a
        href={`${exportPath}?format=xlsx`}
        className={chip}
        onClick={() => track("body_export", { format: "xlsx" })}
      >
        <DownloadIcon size={14} />
        {t("body.exportXlsx")}
      </a>
      <button
        type="button"
        className={chip}
        onClick={() => {
          track("body_export", { format: "pdf" });
          window.print();
        }}
      >
        <PrinterIcon size={14} />
        {t("body.exportPdf")}
      </button>
      <p className="w-full text-xs text-ink-500 sm:w-auto sm:pl-2">
        {t("body.exportHint")}
      </p>
    </div>
  );
};
