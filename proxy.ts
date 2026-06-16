import { type NextRequest, NextResponse } from "next/server";

import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { ROUTES } from "@/lib/i18n/routes";

/**
 * Device-language detection for first-time visitors.
 *
 * On the FIRST visit (no `LOCALE_COOKIE`) to an English (root) path, if the
 * browser's most-preferred language is Spanish we 307-redirect to the ES
 * sibling and persist the cookie so it never redirects again. Any explicit
 * choice is captured by stamping the cookie with the locale of the URL the
 * visitor actually lands on — so navigating EN↔ES (e.g. via LocaleToggle)
 * always wins over detection. Both URLs stay independently crawlable (crawlers
 * send `en`, get EN; 307 keeps it non-authoritative).
 */

const EN_TO_ES = new Map<string, string>(
  Object.values(ROUTES).map((r) => [r.en, r.es]),
);

/** Most-preferred language from an Accept-Language header (respects q-weights). */
const preferredLang = (header: string | null): string | null => {
  if (!header) return null;
  const best = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number.parseFloat(q.slice(2)) : 1;
      return {
        tag: tag.trim().toLowerCase(),
        weight: Number.isNaN(weight) ? 0 : weight,
      };
    })
    .filter((l) => l.tag && l.tag !== "*")
    .sort((a, b) => b.weight - a.weight)[0];
  return best?.tag ?? null;
};

const prefersSpanish = (header: string | null): boolean => {
  const tag = preferredLang(header);
  return tag === "es" || (tag?.startsWith("es-") ?? false);
};

const localeForPath = (pathname: string): Locale =>
  pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";

export const proxy = (request: NextRequest): NextResponse => {
  const { pathname } = request.nextUrl;
  const hasCookie = request.cookies.has(LOCALE_COOKIE);
  const locale = localeForPath(pathname);

  // Already chosen, or already crawlable as-is: just stabilize the cookie.
  if (hasCookie || locale === "es") {
    const res = NextResponse.next();
    if (!hasCookie) res.cookies.set(LOCALE_COOKIE, locale, { path: "/" });
    return res;
  }

  // First visit to an EN path. If the device prefers Spanish and we know the
  // ES sibling, 307-redirect once; otherwise stay on EN. Either way, persist.
  if (prefersSpanish(request.headers.get("accept-language"))) {
    const esPath = EN_TO_ES.get(pathname);
    if (esPath) {
      const url = request.nextUrl.clone();
      url.pathname = esPath;
      const res = NextResponse.redirect(url, 307);
      res.cookies.set(LOCALE_COOKIE, "es", { path: "/" });
      return res;
    }
  }

  const res = NextResponse.next();
  res.cookies.set(LOCALE_COOKIE, "en", { path: "/" });
  return res;
};

export const config = {
  /**
   * Run on page navigations only. Exclude Next internals, the API, SEO/PWA
   * files, and any path with a file extension (static assets, OG images,
   * favicons), so the proxy never redirects those.
   */
  matcher: [
    "/((?!_next/|api/|og/|sitemap.xml|robots.txt|manifest.webmanifest|sw.js|offline|.*\\.).*)",
  ],
};
