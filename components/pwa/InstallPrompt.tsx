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

const DISMISS_KEY = "metri.pwa.installDismissed";

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true);

/** "Add to home screen" affordance. Shows a slim corner banner only when the
 * browser fires `beforeinstallprompt` and the user hasn't dismissed/installed.
 * iOS Safari never fires that event, so this stays a no-op there. */
export const InstallPrompt = () => {
  const t = useT();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
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
    localStorage.setItem(DISMISS_KEY, "1");
    setDeferred(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    track("pwa_install_choice", { outcome });
    setDeferred(null);
  };

  if (!deferred) return null;

  return (
    <div
      role="dialog"
      aria-label={t("pwa.installTitle")}
      className="fixed right-4 bottom-4 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-ink-700 bg-ink-900/95 p-4 shadow-xl backdrop-blur"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("pwa.dismiss")}
        className="absolute top-3 right-3 text-ink-400 hover:text-ink-100"
      >
        <XIcon size={18} />
      </button>
      <div className="flex items-start gap-3 pr-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-900">
          <DownloadIcon size={20} />
        </span>
        <div className="space-y-1">
          <p className="font-display font-semibold text-ink-50">
            {t("pwa.installTitle")}
          </p>
          <p className="text-sm text-ink-300">{t("pwa.installBody")}</p>
        </div>
      </div>
      <Button size="sm" onClick={install} className="mt-3 w-full">
        {t("pwa.install")}
      </Button>
    </div>
  );
};
