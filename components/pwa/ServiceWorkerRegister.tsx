"use client";

import { useEffect } from "react";

/** Registers /sw.js in production only. A no-op in dev so HMR isn't disrupted
 * by a cached service worker. Renders nothing. */
export const ServiceWorkerRegister = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    try {
      // Optional-chained rather than `"serviceWorker" in navigator`: that only
      // proves the accessor exists, and privacy extensions stub the getter to
      // return undefined (as do some embedded WebViews). The read threw
      // synchronously, so the .catch() never attached and it surfaced as an
      // unhandled error. The try/catch covers opaque origins, where merely
      // reading the property raises SecurityError.
      navigator?.serviceWorker?.register("/sw.js").catch((error) => {
        console.warn("SW registration failed", error);
      });
    } catch (error) {
      console.warn("SW unavailable", error);
    }
  }, []);

  return null;
};
