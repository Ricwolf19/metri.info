/**
 * Cookie-consent state. Analytics (PostHog incl. session replay, GA4) must not
 * run until the visitor opts in — strictly-necessary cookies (auth session,
 * theme, locale, units, the consent choice itself) are exempt and always set.
 *
 * The choice lives in a first-party cookie so it survives reloads and can be
 * read server-side later if needed. A `CONSENT_EVENT` lets already-mounted
 * providers (PostHogProvider) react the instant the user accepts, without a
 * full reload.
 */
const CONSENT_COOKIE = "metri_consent";
export const CONSENT_EVENT = "metri:consent";

export type ConsentValue = "granted" | "denied";

export const readConsent = (): ConsentValue | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )metri_consent=([^;]+)/);
  const value = match?.[1];
  return value === "granted" || value === "denied" ? value : null;
};

export const writeConsent = (value: ConsentValue): void => {
  if (typeof document === "undefined") return;
  // One year, lax — same lifetime as the locale cookie.
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
};
