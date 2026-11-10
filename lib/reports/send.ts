import "server-only";

import { and, asc, eq, isNull } from "drizzle-orm";
import { Resend } from "resend";

import { db } from "@/lib/db";
import { monthlyReport, user, userProfile } from "@/lib/db/schema";
import {
  renderMonthlyReportEmail,
  renderMonthlyTipsEmail,
} from "@/lib/emails/render";
import { senderAddress } from "@/lib/emails/sender";
import { can } from "@/lib/entitlements";
import { createT, type Locale, localeFromTag } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { event } from "@/lib/log/logger";
import { getLatestRelease } from "@/lib/releases/store";
import {
  signUnsubscribeToken,
  unsubscribeApiUrl,
  unsubscribePageUrl,
} from "@/lib/emails/unsubscribe";
import { absoluteUrl } from "@/lib/utils";

import { loadReportData, loadTipsSignals, type ReportData } from "./data";
import { monthLabel, reportFilename } from "./format";
import {
  buildMonthlyReport,
  hasEnoughData,
  type MonthlyReport,
  NEXT_STEP_GUIDE,
  reportPeriodFor,
} from "./monthly";
import { renderMonthlyReportPdf } from "./pdf";
import { buildTipsEdition, type TipsReason } from "./tips";

/** Resend's default rate limit is ~2 requests/s; stay under it between sends. */
const SEND_GAP_MS = 600;
const RATE_LIMIT_BACKOFF_MS = 1500;
/** Stop short of the function's 300 s; the next day's run picks up the rest. */
const RUN_BUDGET_MS = 270_000;
/** Several in a row means the provider is down, not that one address is bad. */
const MAX_CONSECUTIVE_FAILURES = 3;
/** The schedule runs on days 2, 3 and 4 (see `vercel.json`). */
const FINAL_RUN_DAY = 4;

type Recipient = {
  id: string;
  email: string;
  name: string;
  plan: string;
  locale: Locale;
  sex: string | null;
  imperial: boolean;
};

export type MonthlyRunOutcome = {
  period: string;
  reports: number;
  tips: number;
  /** Premium accounts with too little data so far; a later run decides. */
  deferred: number;
  failed: number;
  /** False when the run stopped early; the next one resumes. */
  complete: boolean;
};

type Composed = {
  kind: "report" | "tips";
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: Buffer }[];
};

/** Opted-in, verified accounts not yet emailed for this month. */
const readRecipients = async (period: string): Promise<Recipient[]> => {
  const rows = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      locale: userProfile.locale,
      sex: userProfile.sex,
      units: userProfile.unitsPreference,
    })
    .from(user)
    .leftJoin(userProfile, eq(userProfile.id, user.id))
    .leftJoin(
      monthlyReport,
      and(eq(monthlyReport.userId, user.id), eq(monthlyReport.period, period)),
    )
    .where(
      and(
        eq(user.emailVerified, true),
        eq(user.monthlyReportEmails, true),
        isNull(monthlyReport.userId),
      ),
    )
    .orderBy(asc(user.id));
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    plan: r.plan,
    locale: localeFromTag(r.locale),
    sex: r.sex,
    imperial: r.units === "lb",
  }));
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const composeReport = async (
  recipient: Recipient,
  report: MonthlyReport,
  customNames: ReportData["customNames"],
  unsubscribeUrl: string,
): Promise<Composed> => {
  const { locale, imperial, name } = recipient;
  const guideUrl = absoluteUrl(
    `${routePath("docs", locale)}/${NEXT_STEP_GUIDE[report.nextStep]}`,
  );
  const [email, pdf] = await Promise.all([
    renderMonthlyReportEmail({
      locale,
      report,
      imperial,
      customNames,
      bodyUrl: absoluteUrl(routePath("body", locale)),
      guideUrl,
      unsubscribeUrl,
    }),
    renderMonthlyReportPdf({
      locale,
      report,
      name,
      imperial,
      customNames,
      guideUrl,
    }),
  ]);
  return {
    kind: "report",
    subject: createT(locale)("monthlyReport.subject", {
      month: monthLabel(report.period, locale),
    }),
    html: email.html,
    text: email.text,
    attachments: [{ filename: reportFilename(report.period), content: pdf }],
  };
};

const composeTips = async (
  recipient: Recipient,
  period: string,
  reason: TipsReason,
  latestVersion: string | null,
  unsubscribeUrl: string,
): Promise<Composed> => {
  const signals = await loadTipsSignals(
    recipient.id,
    period,
    reason,
    latestVersion,
  );
  const email = await renderMonthlyTipsEmail({
    locale: recipient.locale,
    period,
    edition: buildTipsEdition(period, signals),
    unsubscribeUrl,
  });
  return {
    kind: "tips",
    subject: createT(recipient.locale)("monthlyTips.subject"),
    html: email.html,
    text: email.text,
  };
};

/**
 * What one account gets this month. Premium with enough in the month gets the
 * report and its PDF. Everyone else gets the tips edition, because nobody on
 * the list should receive an empty report: free accounts straight away, and
 * Premium accounts on the last run only, since a phone that hasn't synced yet
 * may still turn theirs into a real report. Null means "not yet".
 */
const compose = async (
  recipient: Recipient,
  period: string,
  finalRun: boolean,
  latestVersion: string | null,
  unsubscribeUrl: string,
): Promise<Composed | null> => {
  if (!can(recipient.plan, "sync"))
    return composeTips(
      recipient,
      period,
      "no_data",
      latestVersion,
      unsubscribeUrl,
    );

  const { input, customNames } = await loadReportData(
    recipient.id,
    recipient.sex,
    period,
  );
  const report = buildMonthlyReport(input);
  if (hasEnoughData(report))
    return composeReport(recipient, report, customNames, unsubscribeUrl);
  if (!finalRun) return null;
  const hasHistory = input.sessions.length > 0 || input.weighIns.length > 0;
  return composeTips(
    recipient,
    period,
    hasHistory ? "quiet_month" : "no_data",
    latestVersion,
    unsubscribeUrl,
  );
};

type Delivery = { ok: true } | { ok: false; error: unknown };

/** One send; a 429 waits once and retries before giving up. */
const deliver = async (
  resend: Resend,
  payload: Parameters<Resend["emails"]["send"]>[0],
  idempotencyKey: string,
): Promise<Delivery> => {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { error } = await resend.emails.send(payload, { idempotencyKey });
    if (!error) return { ok: true };
    if (error.name !== "rate_limit_exceeded" || attempt === 1)
      return { ok: false, error: error.message };
    await sleep(RATE_LIMIT_BACKOFF_MS);
  }
  return { ok: false, error: "unreachable" };
};

/**
 * Email the month that just ended to everyone on the list not reached yet.
 *
 * One call per person: Resend's batch endpoint doesn't take attachments, and
 * nothing here can be shared between recipients anyway. Safe to repeat: a
 * `monthly_report` row marks each account done once Resend accepted its email,
 * and the idempotency key covers a crash between the two. One account's bad
 * data never stops the others; repeated failures end the run for tomorrow's.
 */
export const sendMonthlyEmails = async (
  now = new Date(),
): Promise<MonthlyRunOutcome> => {
  const period = reportPeriodFor(now);
  const outcome: MonthlyRunOutcome = {
    period,
    reports: 0,
    tips: 0,
    deferred: 0,
    failed: 0,
    complete: true,
  };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !signUnsubscribeToken("probe", "monthly")) {
    // No signing secret means no working unsubscribe link: refuse to send
    // rather than mail people something they cannot opt out of.
    event.error("monthly.send-skipped", {
      period,
      reason: apiKey ? "BETTER_AUTH_SECRET_missing" : "RESEND_API_KEY_missing",
    });
    return { ...outcome, complete: false };
  }

  const recipients = await readRecipients(period);
  if (recipients.length === 0) return outcome;

  const startedAt = Date.now();
  const finalRun = now.getUTCDate() >= FINAL_RUN_DAY;
  const latestVersion = (await getLatestRelease())?.version ?? null;
  const resend = new Resend(apiKey);
  let sentAny = false;
  let failuresInARow = 0;

  for (const recipient of recipients) {
    if (Date.now() - startedAt > RUN_BUDGET_MS) {
      outcome.complete = false;
      break;
    }
    try {
      const token = signUnsubscribeToken(recipient.id, "monthly") ?? "";
      const composed = await compose(
        recipient,
        period,
        finalRun,
        latestVersion,
        unsubscribePageUrl(token, recipient.locale, "monthly"),
      );
      if (!composed) {
        outcome.deferred += 1;
        continue;
      }
      if (sentAny) await sleep(SEND_GAP_MS);
      const delivery = await deliver(
        resend,
        {
          from: senderAddress(),
          to: recipient.email,
          subject: composed.subject,
          html: composed.html,
          text: composed.text,
          attachments: composed.attachments,
          headers: {
            "List-Unsubscribe": `<${unsubscribeApiUrl(token, recipient.locale, "monthly")}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        },
        `monthly-${period}-${recipient.id}`,
      );
      sentAny = true;
      if (!delivery.ok) throw new Error(String(delivery.error));
      await db
        .insert(monthlyReport)
        .values({ userId: recipient.id, period, kind: composed.kind })
        .onConflictDoNothing();
      outcome[composed.kind === "report" ? "reports" : "tips"] += 1;
      failuresInARow = 0;
    } catch (error) {
      outcome.failed += 1;
      failuresInARow += 1;
      event.error("monthly.send-failed", {
        period,
        userId: recipient.id,
        error,
      });
      if (failuresInARow >= MAX_CONSECUTIVE_FAILURES) {
        outcome.complete = false;
        break;
      }
    }
  }

  event.info("monthly.sent", { ...outcome, recipients: recipients.length });
  return outcome;
};
