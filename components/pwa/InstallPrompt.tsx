"use client";

import { useEffect, useState } from "react";

import { DownloadIcon, XIcon } from "@/components/icons";
import { MetriMark } from "@/components/layout/MetriMark";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { useT } from "@/lib/i18n";
import { CONSENT_EVENT, readConsent } from "@/lib/legal/consent";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "metri_pwa_dismissed_until";
/** How long a dismissal silences the prompt. */
const DISMISS_DAYS = 180;
/** Grace before the corner card appears, so it never competes with the hero. */
const SHOW_DELAY_MS = 9000;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as { standalone?: boolean }).standalone === true;

const dismissedUntil = (): number => {
  try {
    return Number(localStorage.getItem(DISMISS_KEY) ?? 0);
  } catch {
    return 0;
  }
};

const silence = () => {
  try {
    localStorage.setItem(
      DISMISS_KEY,
      String(Date.now() + DISMISS_DAYS * 86_400_000),
    );
  } catch {}
};

/**
 * Corner offer to install metri.info as an app. Appears only when the browser
 * says the site is installable (`beforeinstallprompt`), never inside the
 * installed app, only after the cookie choice is made (the two share the
 * corner), and not again for six months after "Not now" or the close button.
 */
export const InstallPrompt = () => {
  const t = useT();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [consented, setConsented] = useState(false);
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (isStandalone() || dismissedUntil() > Date.now()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      track("pwa_installed");
    };
    const onConsent = () => setConsented(readConsent() !== null);
    onConsent();

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener(CONSENT_EVENT, onConsent);
    const timer = window.setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener(CONSENT_EVENT, onConsent);
      window.clearTimeout(timer);
    };
  }, []);

  if (!deferred || !consented || !ready || gone) return null;

  const dismiss = () => {
    silence();
    setGone(true);
    track("pwa_prompt_dismissed");
  };

  const install = async () => {
    const event = deferred;
    setGone(true);
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      track("pwa_install_choice", { outcome });
      if (outcome === "dismissed") silence();
    } catch {
      // The browser can refuse a second prompt(); nothing to recover.
      silence();
    }
  };

  return (
    <div
      role="region"
      aria-labelledby="pwa-prompt-title"
      className="animate-rise fixed bottom-4 left-4 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-card border border-ink-600 bg-ink-850 p-4 shadow-2xl"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("nav.close")}
        className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-50"
      >
        <XIcon size={15} />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field border border-brand/30 bg-brand/10">
          <MetriMark className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p
            id="pwa-prompt-title"
            className="text-sm font-semibold text-ink-50"
          >
            {t("pwa.installTitle")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-300">
            {t("pwa.installBody")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="brand" onClick={install}>
          <DownloadIcon size={15} />
          {t("pwa.install")}
        </Button>
        <Button size="sm" variant="ghost" onClick={dismiss}>
          {t("pwa.dismiss")}
        </Button>
      </div>
    </div>
  );
};
