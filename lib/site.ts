/**
 * Single source of truth for external links and app-store availability.
 * Flip `appStatus` to "live" and fill the URLs when the mobile app ships.
 */

const repos = {
  /** The mobile app — the product showcased on the site. Primary GitHub link. */
  app: "https://github.com/Ricwolf19/metri",
  /** This website's own source. */
  web: "https://github.com/Ricwolf19/metri.info",
} as const;

/** Primary "View on GitHub" target across the landing page = the app repo. */
export const webAppRepo = repos.web;
export const mobileAppRepo = repos.app;

export type AppStatus = "development" | "beta" | "live";

/** @see AGENTS.md#mobile-app-distribution */
export const appDistribution = {
  status: "beta" as AppStatus,
  ios: {
    /** App Store URL once published. */
    url: null as string | null,
    /** Optional TestFlight invite for beta. */
    testflight: null as string | null,
  },
  android: {
    /** Play Store URL once published. */
    url: null as string | null,
    /** GitHub "latest release" permalink — asset name is load-bearing, see AGENTS. */
    apk: `${repos.app}/releases/latest/download/metri.apk`,
  },
} as const;

export const mobileAppReleases = `${repos.app}/releases`;
