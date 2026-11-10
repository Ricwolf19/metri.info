// Resend's shared sender (test mode); production sets a verified sender.
const DEFAULT_FROM = "Metri <onboarding@resend.dev>";

/** One sender for everything an account receives: verification, reset,
 * release and monthly emails. The contact form has its own (CONTACT_FROM_EMAIL),
 * since what it sends goes to the team, not to an account. */
export const senderAddress = (): string =>
  process.env.AUTH_FROM_EMAIL ?? DEFAULT_FROM;
