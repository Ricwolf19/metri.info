"use client";

import { useSyncExternalStore } from "react";

import { AppleIcon, DownloadIcon, GithubIcon } from "@/components/icons";
import { CopyButton } from "@/components/shared/CopyButton";
import { buttonVariants } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const noSubscribe = () => () => undefined;
/** Android marks its embedded browser with `; wv)` in the user agent. */
const isAndroidWebView = () => /; wv\)/.test(navigator.userAgent);

/** Reopens this page in Chrome; the fallback keeps Android on a page if Chrome
 * is missing instead of failing the tap. */
const chromeIntentUrl = () =>
  `intent://${location.host}${location.pathname}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(location.href)};end`;

/**
 * Tapping a link in an email app often lands in its embedded browser, where a
 * file download does nothing at all. Rather than show a button that can't
 * work, this says so and offers Chrome, or the link to paste into any browser.
 */
const OpenInBrowser = () => {
  const t = useT();
  return (
    <div className="mt-8 max-w-xl rounded-card border border-brand/30 bg-brand/10 p-4">
      <p className="font-semibold text-ink-50">{t("download.webviewTitle")}</p>
      <p className="mt-1 text-sm text-ink-300">{t("download.webviewBody")}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={chromeIntentUrl()}
          className={buttonVariants({ variant: "brand", size: "lg" })}
        >
          {t("download.webviewOpen")}
        </a>
        <CopyButton
          value={location.href}
          label={t("download.webviewCopy")}
          copiedLabel={t("calc.copied")}
        />
      </div>
    </div>
  );
};

/** Client-side; the APK <a/> needs onClick for the analytics event. */
export const DownloadButtons = ({
  apk,
  releasesUrl,
  version,
}: {
  apk: string;
  releasesUrl: string;
  version?: string;
}) => {
  const t = useT();
  const inWebView = useSyncExternalStore(
    noSubscribe,
    isAndroidWebView,
    () => false,
  );
  if (inWebView && version) return <OpenInBrowser />;
  return (
    <>
      {version && (
        <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 font-mono text-xs font-semibold tracking-wide text-brand">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />v
          {version}
        </p>
      )}
      <div className={cn("flex flex-wrap gap-3", version ? "mt-3" : "mt-8")}>
        {
          <a
            href={apk}
            onClick={() =>
              track("apk_download_clicked", { platform: "android" })
            }
            className={cn(
              buttonVariants({ variant: "brand", size: "lg" }),
              "transition-transform hover:scale-[1.02]",
            )}
          >
            <DownloadIcon size={18} />
            {t("download.androidDownload")}
          </a>
        }
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
