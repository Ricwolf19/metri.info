import type { Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";

export const CONTACT_TOPICS = [
  "feedback",
  "bug",
  "premium",
  "partnership",
  "other",
] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const isContactTopic = (v: unknown): v is ContactTopic =>
  typeof v === "string" && (CONTACT_TOPICS as readonly string[]).includes(v);

/** Payload the contact form sends to the `sendContactMessage` server action. */
export type ContactInput = {
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  /** reCAPTCHA v3 token; `null` when reCAPTCHA isn't configured. */
  token: string | null;
  locale: Locale;
};

export const MESSAGE_MAX = 5000;

/** The contact form pre-seeded with the Premium request topic. */
export const premiumRequestPath = (locale: Locale): string =>
  `${routePath("contact", locale)}?topic=${"premium" satisfies ContactTopic}`;
