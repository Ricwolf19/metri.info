import type { TFunction } from "@/lib/i18n/config";

/**
 * Map a Better Auth error response to a localized, user-facing message.
 *
 * The forms hand the raw `res.error` (or a thrown object) to this helper;
 * matching on the canonical `code` keeps messages stable across clients and
 * stops surfacing Better Auth's English strings when the user is on the ES
 * locale. Falls back to `errorGeneric` for anything we don't recognise,
 * including Better Auth adding new codes in a future release.
 */
const KEY_BY_CODE: Record<string, Parameters<TFunction>[0]> = {
  USER_ALREADY_EXISTS: "auth.errorUserExists",
  INVALID_EMAIL: "auth.errorEmailInvalid",
  FAILED_TO_CREATE_USER: "auth.errorGeneric",
  EMAIL_ALREADY_EXISTS: "auth.errorUserExists",
  INVALID_PASSWORD: "auth.errorInvalidCredentials",
  USER_NOT_FOUND: "auth.errorInvalidCredentials",
  INVALID_EMAIL_OR_PASSWORD: "auth.errorInvalidCredentials",
  PASSWORD_TOO_SHORT: "auth.errorPasswordShort",
  PASSWORD_TOO_LONG: "auth.errorPasswordLong",
  INVALID_TOKEN: "auth.errorInvalidToken",
  // Custom code set by the before-hook in server.ts.
  captcha_failed: "auth.errorBot",
  // Already-covered in the form — kept here so future flows don't need to
  // re-import this only when they encounter them.
  EMAIL_NOT_VERIFIED: "auth.errorEmailNotVerified",
};

const NETWORK_RE = /network|fetch failed|failed to fetch|offline|timeout/i;
const RATE_LIMIT_RE = /too many|rate.?limit|429/i;

type AuthErrorLike =
  | {
      code?: string | null;
      message?: string | null;
      status?: number;
    }
  | null
  | undefined;

export const authErrorMessage = (t: TFunction, err: AuthErrorLike): string => {
  if (!err) return t("auth.errorGeneric");

  // 429 is the canonical HTTP status for rate-limited routes. Better Auth's
  // thrown errors sometimes carry the status without a stable code, so we
  // match both status and the typical English message.
  if (err.status === 429 || RATE_LIMIT_RE.test(err.message ?? "")) {
    return t("auth.errorRateLimit");
  }

  if (err.code) {
    const key = KEY_BY_CODE[err.code] ?? KEY_BY_CODE[err.code.toUpperCase()];
    if (key) return t(key);
  }
  if (NETWORK_RE.test(err.message ?? "")) {
    return t("auth.errorNetwork");
  }
  return t("auth.errorGeneric");
};
