import "server-only";

import { and, asc, eq, gt, lte } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { Resend } from "resend";

import { tags } from "@/lib/cache/tags";
import { db } from "@/lib/db";
import { user, userProfile } from "@/lib/db/schema";
import { renderReleaseEmail } from "@/lib/emails/render";
import type { Locale } from "@/lib/i18n/config";
import { createT } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { event } from "@/lib/log/logger";
import { absoluteUrl } from "@/lib/utils";

import { type FetchFailure, fetchReleaseByTag } from "./github";
import { markNotified, saveNotifyCursor, upsertRelease } from "./store";
import type { AppRelease } from "./types";
import {
  signUnsubscribeToken,
  unsubscribeApiUrl,
  unsubscribePageUrl,
} from "./unsubscribe";

/** Resend's batch endpoint accepts at most 100 messages per call. */
const BATCH_SIZE = 100;
/** Resend's default rate limit is ~2 requests/s; stay under it between batches. */
const BATCH_GAP_MS = 600;
/** One wait-and-retry when a batch is rate limited anyway (shared account). */
const RATE_LIMIT_BACKOFF_MS = 1500;
/** Swapped for each recipient's own link after rendering once per locale. */
const UNSUBSCRIBE_PLACEHOLDER = "__METRI_UNSUBSCRIBE_URL__";
// Resend's shared sender (test mode); production sets a verified sender.
const DEFAULT_FROM = "Metri <onboarding@resend.dev>";

export type NotifyOutcome =
  | { ok: true; emailed: number }
  | { ok: false; reason: FetchFailure };

type Recipient = { id: string; email: string; locale: Locale };

const toLocale = (value: string | null): Locale =>
  value?.toLowerCase().startsWith("es") ? "es" : "en";

/**
 * Verified accounts that kept release emails on and existed when the release
 * was published, ordered by id, after `cursor` (the last id already sent).
 * Freezing the audience at publication and resuming by id is what keeps a
 * retry from re-mailing anyone: a signup or an opt-out between attempts can
 * no longer shift which people land in which batch.
 */
const readRecipients = async (
  publishedAt: Date,
  cursor: string | null,
): Promise<Recipient[]> => {
  const rows = await db
    .select({ id: user.id, email: user.email, locale: userProfile.locale })
    .from(user)
    .leftJoin(userProfile, eq(userProfile.id, user.id))
    .where(
      and(
        eq(user.emailVerified, true),
        eq(user.releaseEmails, true),
        lte(user.createdAt, publishedAt),
        cursor ? gt(user.id, cursor) : undefined,
      ),
    )
    .orderBy(asc(user.id));
  return rows.map((r) => ({ ...r, locale: toLocale(r.locale) }));
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type BatchResult =
  | { ok: true; accepted: number }
  | { ok: false; error: unknown };

const renderFor = async (release: AppRelease, locale: Locale) => {
  const rendered = await renderReleaseEmail({
    locale,
    version: release.version,
    notes: release.notes,
    apkUrl: release.apkUrl,
    downloadPageUrl: absoluteUrl(routePath("download", locale)),
    unsubscribeUrl: UNSUBSCRIBE_PLACEHOLDER,
  });
  return {
    ...rendered,
    subject: createT(locale)("releaseEmail.subject", {
      version: release.version,
    }),
  };
};

/** One Resend batch call; a 429 waits once and retries before giving up. */
const sendBatch = async (
  resend: Resend,
  chunk: Parameters<Resend["batch"]["send"]>[0],
  idempotencyKey: string,
): Promise<BatchResult> => {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { data, error } = await resend.batch.send(chunk, {
        idempotencyKey,
      });
      if (!error)
        return { ok: true, accepted: data?.data.length ?? chunk.length };
      const limited = error.name === "rate_limit_exceeded";
      if (!limited || attempt === 1) return { ok: false, error: error.message };
      await sleep(RATE_LIMIT_BACKOFF_MS);
    } catch (error) {
      return { ok: false, error };
    }
  }
  return { ok: false, error: "unreachable" };
};

/**
 * Send the announcement to every eligible recipient not reached yet. Returns
 * how many Resend accepted and whether the run finished — only a finished run
 * lets the caller stamp `notifiedAt`.
 *
 * Batches go out in order and the cursor (last recipient id sent) is saved
 * after each accepted one, so a retry resumes where the last attempt stopped
 * instead of starting over. The idempotency key is tied to that cursor: if a
 * crash lands between Resend accepting a batch and the cursor being saved,
 * the retry rebuilds the same batch under the same key and Resend drops it.
 * The first failure stops the run — skipping ahead would break the cursor.
 */
const sendAnnouncement = async (
  release: AppRelease,
  startCursor: string | null,
): Promise<{ emailed: number; complete: boolean }> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    event.error("release.email.send-skipped", {
      tag: release.tag,
      reason: "RESEND_API_KEY_missing",
    });
    return { emailed: 0, complete: false };
  }

  const recipients = await readRecipients(
    new Date(release.publishedAt),
    startCursor,
  );
  if (recipients.length === 0) return { emailed: 0, complete: true };
  if (!signUnsubscribeToken("probe")) {
    // No signing secret → no working unsubscribe link: refuse to send
    // rather than mail people something they cannot opt out of.
    event.error("release.email.send-skipped", {
      tag: release.tag,
      reason: "BETTER_AUTH_SECRET_missing",
    });
    return { emailed: 0, complete: false };
  }

  // One sender for everything an account receives (verification, reset, releases).
  const from = process.env.AUTH_FROM_EMAIL ?? DEFAULT_FROM;
  const templates = {
    en: await renderFor(release, "en"),
    es: await renderFor(release, "es"),
  };
  const toMessage = (r: Recipient) => {
    const token = signUnsubscribeToken(r.id) ?? "";
    const page = unsubscribePageUrl(token, r.locale);
    const tpl = templates[r.locale];
    return {
      from,
      to: r.email,
      subject: tpl.subject,
      html: tpl.html.replaceAll(UNSUBSCRIBE_PLACEHOLDER, page),
      text: tpl.text.replaceAll(UNSUBSCRIBE_PLACEHOLDER, page),
      headers: {
        "List-Unsubscribe": `<${unsubscribeApiUrl(token, r.locale)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
  };

  const resend = new Resend(apiKey);
  let cursor = startCursor;
  let emailed = 0;
  let complete = true;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    if (i > 0) await sleep(BATCH_GAP_MS);
    const chunk = recipients.slice(i, i + BATCH_SIZE);
    const key = `release-${release.tag}-after-${cursor ?? "start"}`;
    const result = await sendBatch(resend, chunk.map(toMessage), key);
    if (!result.ok) {
      complete = false;
      event.error("release.email.batch-failed", {
        tag: release.tag,
        size: chunk.length,
        error: result.error,
      });
      break;
    }
    emailed += result.accepted;
    cursor = chunk[chunk.length - 1].id;
    await saveNotifyCursor(release.tag, cursor);
  }
  event.info("release.email.sent", {
    tag: release.tag,
    emailed,
    recipients: recipients.length,
    complete,
  });
  return { emailed, complete };
};

/**
 * The release webhook's work: fetch the release from GitHub by tag (the
 * webhook body is never trusted beyond the tag), store it, expire the cached
 * "latest", and announce it once. A replay after a clean announcement
 * refreshes the row and emails nobody; a replay after a partial failure
 * resumes from the saved cursor, so nobody is mailed twice.
 */
export const notifyRelease = async (tag: string): Promise<NotifyOutcome> => {
  const fetched = await fetchReleaseByTag(tag);
  if (!fetched.ok) {
    event.warn("release.notify-rejected", { tag, reason: fetched.reason });
    return { ok: false, reason: fetched.reason };
  }
  const { release } = fetched;

  const { notified, cursor } = await upsertRelease(release);
  // Webhook semantics: expire now, so the next read (API or Download page)
  // blocks on fresh data instead of serving the previous release once more.
  revalidateTag(tags.appRelease, { expire: 0 });
  event.info("release.stored", { tag, version: release.version });

  if (notified) return { ok: true, emailed: 0 };

  const { emailed, complete } = await sendAnnouncement(release, cursor);
  if (complete) await markNotified(tag);
  return { ok: true, emailed };
};
