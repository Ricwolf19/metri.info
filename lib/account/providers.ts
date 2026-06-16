/** Client-safe provider constants (no DB / server-only imports). */

/** Social providers we offer to link in the settings UI (excludes `credential`). */
export const SOCIAL_PROVIDERS = ["google", "github"] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

/** Password presence: the email/password credential is stored as an `account`
 * row with `providerId === "credential"` — that's how Better Auth records it. */
export const hasPassword = (providerIds: string[]): boolean =>
  providerIds.includes("credential");
