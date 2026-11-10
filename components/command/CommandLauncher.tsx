"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { CMDK_EVENT } from "@/components/command/CommandPaletteMount";
import { SearchIcon, XIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { isChromelessPath } from "@/lib/i18n/routes";

const HIDE_KEY = "metri.cmdk.launcherHidden";
const HIDE_EVENT = "metri:cmdk-launcher";

const readHidden = (): boolean => {
  try {
    return localStorage.getItem(HIDE_KEY) === "1";
  } catch {
    return false;
  }
};

const setHiddenPersist = (hidden: boolean) => {
  try {
    localStorage.setItem(HIDE_KEY, hidden ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(HIDE_EVENT));
};

const subscribe = (cb: () => void) => {
  window.addEventListener(HIDE_EVENT, cb);
  return () => window.removeEventListener(HIDE_EVENT, cb);
};

/**
 * Floating search launcher — sits just below the navbar, top-right, with a
 * smooth brand-green neon ring so it reads as a live, ambient affordance
 * (keeps the navbar itself uncluttered). Can be collapsed to a 3-dot snippet
 * (persisted), which re-expands on click. Opens the ⌘K palette.
 */
export const CommandLauncher = () => {
  const t = useT();
  const pathname = usePathname() ?? "/";
  // `false` on the server / first paint so it's not hidden by default.
  const hidden = useSyncExternalStore(subscribe, readHidden, () => false);
  // Collapsing or expanding swaps the buttons; the press's focus follows to
  // the button that replaced it instead of dropping to <body>.
  const showRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (hidden ? showRef : openRef).current?.focus();
  }, [hidden]);
  const toggle = (next: boolean) => {
    moveFocus.current = true;
    setHiddenPersist(next);
  };

  const openPalette = () => window.dispatchEvent(new Event(CMDK_EVENT));

  if (isChromelessPath(pathname)) return null;

  return (
    <div className="fixed top-[4.5rem] right-4 z-40 hidden sm:block print:hidden">
      {hidden ? (
        <button
          ref={showRef}
          type="button"
          onClick={() => toggle(false)}
          aria-label={t("cmd.show")}
          className="flex h-8 items-center gap-[3px] rounded-full border border-ink-600 bg-ink-900/90 px-3 text-ink-400 shadow-lg backdrop-blur transition-colors hover:text-ink-100"
        >
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
        </button>
      ) : (
        <div className="neon-ring rounded-full">
          <div className="flex items-center gap-1 rounded-full bg-ink-900/90 p-1 pl-1.5 shadow-lg backdrop-blur">
            <button
              ref={openRef}
              type="button"
              onClick={openPalette}
              aria-keyshortcuts="Meta+K Control+K"
              className="flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm text-ink-200 transition-colors hover:text-ink-50"
            >
              <SearchIcon size={16} className="text-brand" />
              {t("cmd.open")}
              <kbd
                aria-hidden
                className="rounded border border-ink-600 px-1.5 py-0.5 font-mono text-[10px] text-ink-400"
              >
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => toggle(true)}
              aria-label={t("cmd.hide")}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-800 hover:text-ink-200"
            >
              <XIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
