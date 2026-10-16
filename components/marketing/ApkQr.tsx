"use client";

import { QRCodeSVG } from "qrcode.react";

/** QR for the versioned APK URL — scan from the phone instead of retyping. */
export const ApkQr = ({ url, label }: { url: string; label: string }) => (
  <figure className="flex flex-col items-center gap-3">
    <div className="rounded-card border border-ink-600 bg-ink-50 p-3 text-ink-950">
      <QRCodeSVG
        value={url}
        size={132}
        level="M"
        bgColor="transparent"
        fgColor="currentColor"
        aria-label={label}
      />
    </div>
    <figcaption className="font-mono text-[11px] tracking-wide text-ink-400 uppercase">
      {label}
    </figcaption>
  </figure>
);
