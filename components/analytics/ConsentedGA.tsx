"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useSyncExternalStore } from "react";

import { CONSENT_EVENT, readConsent } from "@/lib/legal/consent";

const subscribe = (onChange: () => void) => {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
};

/**
 * GA4, but only after the visitor grants cookie consent. We mount the script
 * tag conditionally (rather than loading gtag and toggling its flags) so no
 * Google network request fires until opt-in. Reacts to the consent event so
 * accepting the banner enables GA without a reload.
 */
export const ConsentedGA = ({ gaId }: { gaId: string }) => {
  const consent = useSyncExternalStore(subscribe, readConsent, () => null);
  if (consent !== "granted") return null;
  return <GoogleAnalytics gaId={gaId} />;
};
