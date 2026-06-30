/** Map a `VerificationResult` failure reason to user-facing copy. Shared by contact + sign-up to keep the message consistent. */
export const captchaErrorMessage = (reason: string): string =>
  reason === "missing_token"
    ? "Please confirm you're human before submitting."
    : "We couldn't verify you're human. Please try again.";
