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

export type AppStatus = "development" | "live";

/**
 * Mobile app distribution. While `status === "development"` the download page
 * shows a "coming soon" state instead of store badges. To launch: set
 * status "live" and fill the store URLs (and optionally TestFlight/APK).
 */
export const appDistribution = {
  status: "development" as AppStatus,
  ios: {
    /** App Store URL once published. */
    url: null as string | null,
    /** Optional TestFlight invite for beta. */
    testflight: null as string | null,
  },
  android: {
    /** Play Store URL once published. */
    url: null as string | null,
    /** Optional direct APK for sideloading. */
    apk: null as string | null,
  },
} as const;
