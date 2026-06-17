"use client";

import { useEffect, useState } from "react";

import { DownloadIcon, XIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { useT } from "@/lib/i18n";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** When the user closes the banner we snooze it for this long — long enough to
 * stop nagging on a quick refresh, short enough to offer again later the session. */
const SNOOZE_MS = 10 * 60 * 1000;
/** Timestamp (ms) until which the banner stays hidden after an explicit dismiss. */
const SNOOZE_KEY = "metri.pwa.installSnoozedUntil";

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true);

/** True when the banner should stay hidden: already running as the installed app,
 * or snoozed via a recent dismiss. We deliberately do NOT persist an "installed"
 * flag — the browser only fires `beforeinstallprompt` while the app is
 * installable, so it reappears on its own if the user later uninstalls. */
const isSuppressed = () => {
  if (isStandalone()) return true;
  const snoozedUntil = Number(localStorage.getItem(SNOOZE_KEY) ?? 0);
  return Number.isFinite(snoozedUntil) && Date.now() < snoozedUntil;
};

/** "Add to home screen" affordance. Shows a slim corner banner only when the
 * browser fires `beforeinstallprompt` and the user hasn't dismissed/installed.
 * iOS Safari never fires that event, so this stays a no-op there. */
export const InstallPrompt = () => {
  const t = useT();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    if (isSuppressed()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      if (isSuppressed()) return;
      setDeferred(event as BeforeInstallPromptEvent);
      track("pwa_install_prompted");
    };
    const onInstalled = () => {
      track("pwa_installed");
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    setDeferred(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    track("pwa_install_choice", { outcome });
    // A dismissed native prompt should also snooze the banner, not vanish forever.
    if (outcome === "dismissed") {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    }
    setDeferred(null);
  };

  if (!deferred) return null;

  return (
    <div
      role="dialog"
      aria-label={t("pwa.installTitle")}
      className="fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full border border-ink-700 bg-ink-900/95 p-1 shadow-lg backdrop-blur"
    >
      <Button
        size="sm"
        onClick={install}
        className="gap-2 rounded-full whitespace-nowrap"
      >
        <DownloadIcon size={16} />
        {t("pwa.installTitle")}
      </Button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("pwa.dismiss")}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
};
