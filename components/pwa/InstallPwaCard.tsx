"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { CheckIcon, DownloadIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { useT } from "@/lib/i18n";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** `true` after mount, `false`/SSR before — lets us read client-only APIs
 * without a hydration mismatch or a setState-in-effect lint violation. */
const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as { standalone?: boolean }).standalone === true;

const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

/**
 * PWA install affordance for the /download page — works on desktop and mobile.
 * Uses the captured `beforeinstallprompt` event where available (Chrome/Edge),
 * falls back to iOS "Add to Home Screen" guidance, and confirms when already
 * installed. Replaces the old floating banner (kept for a future store launch).
 */
export const InstallPwaCard = () => {
  const t = useT();
  const mounted = useMounted();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      track("pwa_installed");
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    track("pwa_install_choice", { outcome });
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  const standalone = mounted && isStandalone();
  const done = installed || standalone;
  const ios = mounted && isIOS() && !standalone;

  return (
    <div className="mx-auto mt-12 max-w-2xl">
      <div className="relative overflow-hidden rounded-card border border-brand/20 bg-ink-850 p-6 sm:p-8">
        <div
          aria-hidden
          className="glow-brand pointer-events-none absolute inset-x-0 top-0 h-24"
        />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-ink-50">
              {t("download.pwaTitle")}
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-ink-300">
              {t("download.pwaBody")}
            </p>
          </div>

          <div className="shrink-0">
            {done ? (
              <span className="inline-flex items-center gap-2 rounded-field border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand">
                <CheckIcon size={16} />
                {t("download.pwaInstalled")}
              </span>
            ) : deferred ? (
              <Button variant="brand" onClick={install}>
                <DownloadIcon size={18} />
                {t("download.pwaInstall")}
              </Button>
            ) : (
              <p className="max-w-[14rem] text-sm text-ink-400">
                {ios ? t("download.pwaIosHint") : t("download.pwaHint")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
