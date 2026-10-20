"use client";

import { useSyncExternalStore } from "react";

import { LinkIcon, ShareIcon } from "@/components/icons";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics/track";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const noop = () => () => {};
const useNativeShare = () =>
  useSyncExternalStore(
    noop,
    () => typeof navigator !== "undefined" && !!navigator.share,
    () => false,
  );

/**
 * One control to pass a page on: the native share sheet where the device has
 * one (phones), otherwise the link goes to the clipboard with a toast. `path`
 * defaults to the current page; `title` seeds the share sheet. Icon-only at
 * `variant="icon"` for toolbars, a labelled chip elsewhere.
 */
export const ShareButton = ({
  title,
  path,
  variant = "chip",
  className,
}: {
  title?: string;
  path?: string;
  variant?: "chip" | "icon";
  className?: string;
}) => {
  const t = useT();
  const { toast } = useToast();
  const native = useNativeShare();

  const share = async () => {
    const url = path
      ? new URL(path, window.location.origin).href
      : window.location.href;
    const shareTitle = title ?? document.title;
    track("page_shared", {
      path: new URL(url).pathname,
      method: native ? "native" : "copy",
    });
    if (native) {
      try {
        await navigator.share({ url, title: shareTitle });
        return;
      } catch {
        // Cancelled, or the sheet refused the payload: fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: t("share.copied"), description: url, variant: "success" });
    } catch {
      // The clipboard refused (insecure context, permission). The URL is in
      // the address bar; a failure banner only adds noise.
    }
  };

  const label = native ? t("share.action") : t("share.copyLink");
  const Icon = native ? ShareIcon : LinkIcon;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={share}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-field border border-ink-600 bg-ink-800 text-ink-300 transition-colors hover:bg-ink-700 hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none",
          className,
        )}
      >
        <Icon size={16} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5 text-sm font-medium text-ink-200 transition-colors hover:border-brand/40 hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none",
        className,
      )}
    >
      <Icon size={15} className="text-brand" />
      {label}
    </button>
  );
};
