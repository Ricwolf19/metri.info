"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, useSyncExternalStore } from "react";

import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ShareIcon,
} from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import type { CalcId } from "@/lib/calculators/types";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const noop = () => () => {};
// Client-only check — false during SSR, resolved on hydration (no effect,
// no hydration mismatch).
const useNativeShare = () =>
  useSyncExternalStore(
    noop,
    () => !!navigator.share,
    () => false,
  );

/**
 * Share a calculator result. The inputs live in the `search` string and the
 * result recomputes from them, so the built URL *is* the shareable snapshot —
 * no account, no stored state, fully reproducible. Offers a copy link, a QR
 * (encoded on-device, so the link never leaves the browser), the native share
 * sheet, and a branded result-card image rendered by the /og/calc route.
 */
export const ShareDialog = ({
  calcId,
  locale,
  search,
}: {
  calcId: CalcId;
  locale: Locale;
  search: string;
}) => {
  const t = useT();
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const canNativeShare = useNativeShare();

  const capture = (open: boolean) => {
    if (!open) return;
    const { origin } = window.location;
    const suffix = `id=${calcId}&locale=${locale}${search ? `&${search}` : ""}`;
    // Point at the /s share landing (rich OG preview when pasted in chats), not
    // the static calc page whose preview can't read query params.
    setUrl(
      `${origin}/s/${calcId}?locale=${locale}${search ? `&${search}` : ""}`,
    );
    setImageUrl(`${origin}/og/calc?${suffix}`);
    setCopied(false);
  };

  const copy = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const nativeShare = () => {
    navigator.share?.({ url, title: document.title }).catch(() => {});
  };

  return (
    <Dialog onOpenChange={capture}>
      <DialogTrigger
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border border-ink-600 px-3 py-2 text-xs font-medium text-ink-300 transition-colors",
          "hover:bg-ink-700 hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-ink-500/50 focus-visible:outline-none",
        )}
      >
        <ShareIcon size={14} />
        {t("calc.shareCta")}
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>{t("calc.shareTitle")}</DialogTitle>
        <DialogDescription className="mt-1.5">
          {t("calc.shareDesc")}
        </DialogDescription>

        <div className="mt-5 flex flex-col items-center gap-3">
          <div className="rounded-xl bg-white p-3">
            {url && (
              <QRCodeSVG value={url} size={148} fgColor="#18181b" level="M" />
            )}
          </div>
          <p className="text-xs text-ink-400">{t("calc.shareQrHint")}</p>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-ink-600 bg-ink-850 p-1.5 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink-300">
            {url}
          </span>
          <button
            type="button"
            onClick={copy}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              copied
                ? "text-accent"
                : "bg-ink-700 text-ink-100 hover:bg-ink-600",
            )}
          >
            {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
            {copied ? t("calc.copied") : t("calc.share")}
          </button>
        </div>

        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-600 py-2 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50"
          >
            <ShareIcon size={15} />
            {t("calc.shareNative")}
          </button>
        )}

        <div className="mt-5 border-t border-ink-700 pt-5">
          <p className="text-xs font-semibold tracking-wider text-ink-400 uppercase">
            {t("calc.cardTitle")}
          </p>
          {imageUrl && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 block overflow-hidden rounded-xl border border-ink-600"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className="aspect-[1200/630] w-full bg-ink-850 object-cover"
              />
            </a>
          )}
          <a
            href={imageUrl}
            download={`metri-${calcId}.png`}
            className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-600 py-2 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50"
          >
            <DownloadIcon size={15} />
            {t("calc.saveImage")}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
