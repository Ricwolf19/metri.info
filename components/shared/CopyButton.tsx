"use client";

import { useEffect, useRef, useState } from "react";

import { CheckIcon, CopyIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Copies `value` to the clipboard and confirms with a check for two seconds. */
export const CopyButton = ({
  value,
  label,
  copiedLabel,
  className,
}: {
  value: string;
  label: string;
  copiedLabel: string;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context / permissions) — the value stays
      // selectable next to the button, so there is nothing else to do.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? copiedLabel : label}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-field border px-3 text-xs font-medium transition-colors",
        copied
          ? "border-brand/40 bg-brand/10 text-brand"
          : "border-ink-600 bg-ink-800 text-ink-300 hover:bg-ink-700 hover:text-ink-50",
        "focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none",
        className,
      )}
    >
      {copied ? (
        <CheckIcon size={14} className="animate-check-in" />
      ) : (
        <CopyIcon size={14} />
      )}
      {copied ? copiedLabel : label}
    </button>
  );
};
