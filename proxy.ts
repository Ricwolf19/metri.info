import { NextResponse, type NextRequest } from "next/server";

/**
 * Locale + pathname headers. We use path-based i18n (English at root, Spanish
 * under /es with localized slugs), so the locale is derived from the URL and
 * exposed to Server Components via the `x-locale` header. No redirects — each
 * language has its own canonical URL.
 */
export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const locale =
    pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";

  const headers = new Headers(request.headers);
  headers.set("x-locale", locale);
  headers.set("x-pathname", pathname);

  return NextResponse.next({ request: { headers } });
};

export const config = {
  // Skip Next internals, API routes, and files with an extension.
  matcher: ["/((?!_next/static|_next/image|api|.*\\..*).*)"],
};
