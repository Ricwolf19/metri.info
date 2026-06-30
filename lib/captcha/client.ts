/** reCAPTCHA v3 client loader + token generator.
 *
 * Loads the script on demand (no-op when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is
 * unset); `executeRecaptcha()` returns `null` when the key is missing so
 * callers can degrade gracefully. */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SRC = (siteKey: string): string =>
  `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;

let scriptPromise: Promise<void> | null = null;

/** Lazily inject the reCAPTCHA v3 script; resolves once loaded (or already present). */
const loadRecaptcha = (siteKey: string): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("recaptcha requires window"));
  }
  if (window.grecaptcha) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="https://www.google.com/recaptcha/api.js"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("recaptcha script failed")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = RECAPTCHA_SRC(siteKey);
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("recaptcha script failed"));
    document.head.appendChild(script);
  });
  return scriptPromise;
};

/** Run an invisible reCAPTCHA v3 check. Returns the token, or `null` if disabled (no site key configured). */
export const executeRecaptcha = async (
  action: string,
): Promise<string | null> => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return null;
  if (typeof window === "undefined") return null;
  await loadRecaptcha(siteKey);
  return new Promise<string>((resolve) => {
    window.grecaptcha?.ready(() => {
      window.grecaptcha
        ?.execute(siteKey, { action })
        .then(resolve, () => resolve(""));
    });
  });
};
