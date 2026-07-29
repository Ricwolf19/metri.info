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

/** Rolling pre-release on the mobile repo that only ever holds the current beta
 * APK. Kept separate from release-please's semver releases so the download URL
 * is stable regardless of how often those are cut. */
const APK_TAG = "apk-beta";

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
    /** Fixed-tag download URL — never moves. Deliberately NOT
     * `releases/latest/download/…`: release-please cuts a release on every
     * feature merge, and "latest" would follow it, 404-ing the moment a release
     * ships without an APK attached. Both the tag and the asset name are
     * load-bearing — see AGENTS.md#mobile-app-distribution. */
    apk: `${repos.app}/releases/download/${APK_TAG}/metri.apk`,
  },
} as const;

export const mobileAppReleases = `${repos.app}/releases`;
