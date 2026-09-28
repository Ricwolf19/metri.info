import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import type { Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { absoluteUrl } from "@/lib/utils";

/**
 * Stateless unsubscribe links for release emails: `<b64url(userId)>.<sig>`,
 * where `sig = HMAC-SHA256(key, "v1:" + userId)`.
 *
 * The key is derived from `BETTER_AUTH_SECRET` (always set in production —
 * `lib/env.ts`) with a purpose label, so a signature minted here can never
 * double as a Better Auth token or vice versa. Deliberately NOT the release
 * webhook secret: that one is shared with CI and rotates independently, and
 * rotating it must not dead-link every email already sent. Rotating
 * `BETTER_AUTH_SECRET` does invalidate old links (and every session).
 */

const PURPOSE = "metri:release-unsubscribe";
const VERSION = "v1";

const signingKey = (): Buffer | null => {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(PURPOSE).digest();
};

const sign = (key: Buffer, userId: string): Buffer =>
  createHmac("sha256", key).update(`${VERSION}:${userId}`).digest();

/** Token for a user, or null when no signing secret is configured. */
export const signUnsubscribeToken = (userId: string): string | null => {
  const key = signingKey();
  if (!key) return null;
  const id = Buffer.from(userId, "utf8").toString("base64url");
  return `${id}.${sign(key, userId).toString("base64url")}`;
};

/** The user id a token was minted for, or null for anything forged, altered
 * or malformed. Constant-time on the signature. */
export const verifyUnsubscribeToken = (token: unknown): string | null => {
  if (typeof token !== "string" || token.length > 512) return null;
  const key = signingKey();
  if (!key) return null;
  const [id, sig, ...rest] = token.split(".");
  if (!id || !sig || rest.length > 0) return null;
  const userId = Buffer.from(id, "base64url").toString("utf8");
  if (!userId) return null;
  const given = Buffer.from(sig, "base64url");
  const expected = sign(key, userId);
  if (given.length !== expected.length) return null;
  return timingSafeEqual(given, expected) ? userId : null;
};

/** Opt a user out of release emails. Idempotent; unknown ids are a no-op. */
export const optOutOfReleaseEmails = async (userId: string): Promise<void> => {
  await db
    .update(user)
    .set({ releaseEmails: false, updatedAt: new Date() })
    .where(eq(user.id, userId));
};

/** Human confirmation page (the link in the email body). */
export const unsubscribePageUrl = (token: string, locale: Locale): string =>
  `${absoluteUrl(routePath("unsubscribe", locale))}?token=${token}`;

/** RFC 8058 one-click target (the `List-Unsubscribe` header). */
export const unsubscribeApiUrl = (token: string, locale: Locale): string =>
  `${absoluteUrl("/api/releases/unsubscribe")}?token=${token}&lang=${locale}`;
