"use server";

import { Resend } from "resend";

import { ExternalServiceError, ForbiddenError } from "@/lib/errors";
import { createT, type Locale, type TFunction } from "@/lib/i18n/config";
import { type Result, safeAsync } from "@/lib/result";
import { asString, EMAIL_RE, ensureValid } from "@/lib/validation";

import type { ContactInput } from "./types";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
/** reCAPTCHA v3 score below this is treated as a bot (0 = bot, 1 = human). */
const MIN_RECAPTCHA_SCORE = 0.5;

const DEFAULT_TO = "rhtc19@gmail.com";
/**
 * Resend's shared sender works out of the box (test mode) for delivering to the
 * account owner — no domain verification needed to get started. Swap to a
 * verified domain sender via CONTACT_FROM_EMAIL for production deliverability.
 */
const DEFAULT_FROM = "Metri Contact <onboarding@resend.dev>";

/**
 * Verify a reCAPTCHA v3 token server-side. No-ops (with a warning) when the
 * secret isn't configured so local dev works without keys; in prod, set
 * RECAPTCHA_SECRET_KEY to enforce it.
 */
const verifyRecaptcha = async (
  token: string | null,
  t: TFunction,
): Promise<void> => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn(
      "[contact] RECAPTCHA_SECRET_KEY not set — skipping bot verification.",
    );
    return;
  }
  if (!token) throw new ForbiddenError(t("contact.errorBot"));

  const res = await fetch(RECAPTCHA_VERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  if (!res.ok) {
    throw new ExternalServiceError(undefined, `recaptcha http ${res.status}`);
  }

  const data = (await res.json()) as {
    success: boolean;
    score?: number;
    "error-codes"?: string[];
  };
  if (!data.success || (data.score ?? 0) < MIN_RECAPTCHA_SCORE) {
    throw new ForbiddenError(t("contact.errorBot"), data["error-codes"]);
  }
};

/**
 * Validate, bot-check, and email a contact-form submission to the site owner.
 * Returns a typed `Result` — it never throws; field/validation/service errors
 * come back as `{ ok: false, error }` and unexpected ones are logged + masked.
 */
export const sendContactMessage = async (
  input: ContactInput,
): Promise<Result<{ delivered: true }>> =>
  safeAsync(async () => {
    const locale: Locale = input.locale === "es" ? "es" : "en";
    const t = createT(locale);

    const name = asString(input.name);
    const email = asString(input.email);
    const message = asString(input.message);

    ensureValid({
      name: [
        { valid: name.length >= 2, message: t("contact.errorName") },
        { valid: name.length <= 100, message: t("contact.errorNameLong") },
      ],
      email: [
        { valid: email.length > 0, message: t("contact.errorRequired") },
        { valid: EMAIL_RE.test(email), message: t("contact.errorEmail") },
      ],
      message: [
        { valid: message.length >= 10, message: t("contact.errorMessage") },
        {
          valid: message.length <= 5000,
          message: t("contact.errorMessageLong"),
        },
      ],
    });

    await verifyRecaptcha(input.token, t);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[contact] RESEND_API_KEY not set — cannot send email.");
      throw new ExternalServiceError(t("contact.errorGeneric"));
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? DEFAULT_FROM,
      to: process.env.CONTACT_TO_EMAIL ?? DEFAULT_TO,
      replyTo: email,
      subject: `[metri.info] New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nLocale: ${locale}\n\n${message}`,
    });
    if (error) {
      throw new ExternalServiceError(t("contact.errorGeneric"), error.message);
    }

    return { delivered: true as const };
  });
