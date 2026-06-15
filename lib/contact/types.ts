import type { Locale } from "@/lib/i18n/config";

/** Payload the contact form sends to the `sendContactMessage` server action. */
export type ContactInput = {
  name: string;
  email: string;
  message: string;
  /** reCAPTCHA v3 token; `null` when reCAPTCHA isn't configured. */
  token: string | null;
  locale: Locale;
};
