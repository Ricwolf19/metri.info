"use server";

import { Resend } from "resend";

import { captchaErrorMessage } from "@/lib/captcha/messages";
import { verifyRecaptcha } from "@/lib/captcha/verify";
import { ExternalServiceError, ForbiddenError } from "@/lib/errors";
import { createT, type Locale } from "@/lib/i18n/config";
import { type Result, safeAsync } from "@/lib/result";
import { asString, EMAIL_RE, ensureValid } from "@/lib/validation";

import type { ContactInput } from "./types";

const DEFAULT_TO = "rhtc19@gmail.com";
// Resend's shared sender (test mode) works without domain verification; swap to a verified sender via CONTACT_FROM_EMAIL in production.
const DEFAULT_FROM = "Metri Contact <onboarding@resend.dev>";

/**
 * Validate, bot-check, and email a contact-form submission. Returns a typed
 * `Result` and never throws: field/validation/service errors come back as
 * `{ ok: false, error }` and unexpected ones are logged + masked.
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

    const captcha = await verifyRecaptcha(input.token);
    if (!captcha.ok) {
      throw new ForbiddenError(captchaErrorMessage(captcha.reason));
    }

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
