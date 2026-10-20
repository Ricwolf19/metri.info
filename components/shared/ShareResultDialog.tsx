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
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics/track";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const noop = () => () => {};
const useNativeShare = () =>
  useSyncExternalStore(
    noop,
    () => !!navigator.share,
    () => false,
  );

/**
 * Share a result: a link that reproduces it, a QR of that link (encoded
 * on-device), the native share sheet, and a branded card image that can be
 * copied to the clipboard or downloaded. `links()` runs when the dialog opens
 * (it needs `window.location`), so the trigger can sit in server HTML.
 */
export const ShareResultDialog = ({
  links,
  fileName,
  analyticsId,
  triggerLabel,
  title,
  description,
  triggerClassName,
}: {
  links: () => { url: string; imageUrl: string };
  fileName: string;
  /** Goes into the `share_*` analytics events as `subject`. */
  analyticsId: string;
  triggerLabel: string;
  title: string;
  description: string;
  triggerClassName?: string;
}) => {
  const t = useT();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);
  const canNativeShare = useNativeShare();

  const capture = (open: boolean) => {
    if (!open) return;
    track("share_clicked", { subject: analyticsId });
    const built = links();
    setUrl(built.url);
    setImageUrl(built.imageUrl);
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("share_method", { subject: analyticsId, method: "copy" });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // The link is printed under the QR; selecting it by hand still works.
    }
  };

  /** Copies the PNG itself. Safari needs the blob promise handed to
   * ClipboardItem synchronously inside the click, hence no await before it. */
  const copyImage = async () => {
    if (copyingImage) return;
    setCopyingImage(true);
    try {
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
        throw new Error("unsupported");
      }
      const blob = fetch(imageUrl).then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      });
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      track("share_method", { subject: analyticsId, method: "image_copy" });
      toast({ title: t("share.imageCopied"), variant: "success" });
    } catch {
      // Browsers without image clipboard support (Firefox, some Android
      // WebViews) get the file instead of a failure banner.
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = fileName;
      a.click();
      track("share_method", { subject: analyticsId, method: "image_download" });
    } finally {
      setCopyingImage(false);
    }
  };

  const nativeShare = () => {
    track("share_method", { subject: analyticsId, method: "native" });
    navigator.share?.({ url, title: document.title }).catch(() => {});
  };

  return (
    <Dialog onOpenChange={capture}>
      <DialogTrigger
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
          "border-brand/40 text-brand hover:bg-brand/10",
          "focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none",
          triggerClassName,
        )}
      >
        <ShareIcon size={14} />
        {triggerLabel}
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="mt-1.5">{description}</DialogDescription>

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
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={copyImage}
              disabled={copyingImage}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink-600 py-2 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50 disabled:opacity-60"
            >
              <CopyIcon size={15} />
              {t("share.copyImage")}
            </button>
            <a
              href={imageUrl}
              download={fileName}
              onClick={() =>
                track("share_method", { subject: analyticsId, method: "image" })
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink-600 py-2 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50"
            >
              <DownloadIcon size={15} />
              {t("calc.saveImage")}
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
