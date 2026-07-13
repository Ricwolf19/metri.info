"use client";

import { AppleIcon, DownloadIcon, GithubIcon } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Client-side; the APK <a/> needs onClick for the analytics event. */
export const DownloadButtons = ({
  apk,
  releasesUrl,
}: {
  apk: string | null;
  releasesUrl: string;
}) => {
  const t = useT();
  return (
    <>
      <div className="mt-8 flex flex-wrap gap-3">
        {apk && (
          <a
            href={apk}
            onClick={() =>
              track("apk_download_clicked", { platform: "android" })
            }
            className={cn(
              buttonVariants({ size: "lg" }),
              "transition-transform hover:scale-[1.02]",
            )}
          >
            <DownloadIcon size={18} />
            {t("download.androidDownload")}
          </a>
        )}
        <span
          aria-disabled="true"
          className={cn(
            buttonVariants({ variant: "secondary", size: "lg" }),
            "pointer-events-none opacity-50",
          )}
        >
          <AppleIcon size={18} />
          {t("download.iosBeta")}
        </span>
      </div>
      <a
        href={releasesUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-accent"
      >
        <GithubIcon size={15} />
        {t("download.githubReleases")}
      </a>
    </>
  );
};
