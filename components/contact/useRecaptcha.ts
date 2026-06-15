"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * reCAPTCHA v3 (invisible, score-based). The script loads lazily on mount so it
 * only ever costs the contact page — never the rest of the site / its CWV.
 * Degrades gracefully: with no site key, `execute` returns null and the server
 * skips verification (dev), so the form still works locally.
 */
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const SCRIPT_ID = "recaptcha-v3-script";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

export const useRecaptcha = () => {
  const injected = useRef(false);

  useEffect(() => {
    if (!SITE_KEY || injected.current) return;
    injected.current = true;
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const execute = useCallback(
    async (action: string): Promise<string | null> => {
      const grecaptcha = window.grecaptcha;
      if (!SITE_KEY || !grecaptcha) return null;
      return new Promise((resolve) => {
        grecaptcha.ready(() => {
          grecaptcha
            .execute(SITE_KEY, { action })
            .then(resolve)
            .catch(() => resolve(null));
        });
      });
    },
    [],
  );

  return { execute, enabled: Boolean(SITE_KEY) };
};
