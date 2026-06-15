import { ValidationError } from "@/lib/errors";

/** Pragmatic email shape check (full RFC validation is not worth it here). */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Coerce unknown form input to a trimmed string (never throws). */
export const asString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

type Rule = { valid: boolean; message: string };

/**
 * Evaluate per-field rules and throw a single `ValidationError` collecting the
 * first failing message per field. Pass already-localized messages.
 *
 *   ensureValid({
 *     email: [
 *       { valid: email.length > 0, message: t("contact.errorRequired") },
 *       { valid: EMAIL_RE.test(email), message: t("contact.errorEmail") },
 *     ],
 *   });
 */
export const ensureValid = (fields: Record<string, Rule[]>): void => {
  const errors: Record<string, string> = {};
  for (const [name, rules] of Object.entries(fields)) {
    const failed = rules.find((rule) => !rule.valid);
    if (failed) errors[name] = failed.message;
  }
  if (Object.keys(errors).length > 0) throw new ValidationError(errors);
};
