"use client";

import { useEffect } from "react";

/** Registers /sw.js in production only. A no-op in dev so HMR isn't disrupted
 * by a cached service worker. Renders nothing. */
export const ServiceWorkerRegister = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("SW registration failed", error);
    });
  }, []);

  return null;
};
