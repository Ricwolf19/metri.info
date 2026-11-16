import type { Locale } from "@/lib/i18n/config";

/** "16 Nov" / "16 nov": a day in the reader's language. Takes an ISO date or
 * instant and reads it in UTC, so a plain `YYYY-MM-DD` never shifts a day. */
export const formatDay = (iso: string, locale: Locale): string =>
  new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso));
