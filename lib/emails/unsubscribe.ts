import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import type { Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { absoluteUrl } from "@/lib/utils";

/**
 * Stateless unsubscribe links for account emails (releases, monthly): `<b64url(userId)>.<sig>`,
 * where `sig = HMAC-SHA256(key, "v1:" + userId)`.
 *
 * The key is derived from `BETTER_AUTH_SECRET` (always set in production —
 * `lib/env.ts`) with a purpose label per list, so a signature minted here can
 * never double as a Better Auth token, and a link in one list's email can
 * never unsubscribe from another. Deliberately NOT the release
 * webhook secret: that one is shared with CI and rotates independently, and
 * rotating it must not dead-link every email already sent. Rotating
 * `BETTER_AUTH_SECRET` does invalidate old links (and every session).
 */

export type EmailList = "release" | "monthly";

const PURPOSE: Record<EmailList, string> = {
  release: "metri:release-unsubscribe",
  monthly: "metri:monthly-unsubscribe",
};
const VERSION = "v1";

/** Anything but the newer list reads as "release", which old links rely on. */
export const parseEmailList = (value: unknown): EmailList =>
  value === "monthly" ? "monthly" : "release";

const signingKey = (list: EmailList): Buffer | null => {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(PURPOSE[list]).digest();
};

const sign = (key: Buffer, userId: string): Buffer =>
  createHmac("sha256", key).update(`${VERSION}:${userId}`).digest();

/** Token for a user, or null when no signing secret is configured. */
export const signUnsubscribeToken = (
  userId: string,
  list: EmailList = "release",
): string | null => {
  const key = signingKey(list);
  if (!key) return null;
  const id = Buffer.from(userId, "utf8").toString("base64url");
  return `${id}.${sign(key, userId).toString("base64url")}`;
};

/** The user id a token was minted for, or null for anything forged, altered
 * or malformed. Constant-time on the signature. */
export const verifyUnsubscribeToken = (
  token: unknown,
  list: EmailList = "release",
): string | null => {
  if (typeof token !== "string" || token.length > 512) return null;
  const key = signingKey(list);
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

/** Opt a user out of one list. Idempotent; unknown ids are a no-op. */
export const optOutOfEmails = async (
  userId: string,
  list: EmailList,
): Promise<void> => {
  await db
    .update(user)
    .set({
      ...(list === "monthly"
        ? { monthlyReportEmails: false }
        : { releaseEmails: false }),
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
};

const listParam = (list: EmailList) =>
  list === "release" ? "" : `&list=${list}`;

/** Human confirmation page (the link in the email body). */
export const unsubscribePageUrl = (
  token: string,
  locale: Locale,
  list: EmailList = "release",
): string =>
  `${absoluteUrl(routePath("unsubscribe", locale))}?token=${token}${listParam(list)}`;

/** RFC 8058 one-click target (the `List-Unsubscribe` header). */
export const unsubscribeApiUrl = (
  token: string,
  locale: Locale,
  list: EmailList = "release",
): string =>
  `${absoluteUrl("/api/releases/unsubscribe")}?token=${token}&lang=${locale}${listParam(list)}`;
