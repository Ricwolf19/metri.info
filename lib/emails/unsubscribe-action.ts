"use server";

import { redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { event } from "@/lib/log/logger";

import { optOutOfReleaseEmails, verifyUnsubscribeToken } from "./unsubscribe";

/**
 * The confirmation page's "Unsubscribe" button. The token is the only
 * authority (no session needed — the link came from the user's own inbox);
 * a forged or altered one just re-renders the page's invalid state.
 */
export const confirmUnsubscribe = async (formData: FormData): Promise<void> => {
  const rawLocale = formData.get("locale");
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const page = routePath("unsubscribe", locale);
  const token = formData.get("token");
  const userId = verifyUnsubscribeToken(token);
  if (!userId) redirect(page);

  try {
    await optOutOfReleaseEmails(userId);
  } catch (error) {
    event.error("release.unsubscribe-failed", { userId, error });
    redirect(`${page}?token=${encodeURIComponent(String(token))}`);
  }
  event.info("release.unsubscribed", { userId, via: "page" });
  redirect(`${page}?done=1`);
};
