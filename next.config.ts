import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

import { ROUTES } from "./lib/i18n/routes";

/** The fonts `lib/og/render.tsx` draws every card with. */
const OG_FONTS = [
  "./node_modules/geist/dist/fonts/geist-sans/Geist-{Regular,Bold}.ttf",
  "./node_modules/geist/dist/fonts/geist-mono/GeistMono-Medium.ttf",
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  // Enables `use cache` / `cacheTag` / `cacheLife`, makes PPR the default (a
  // static shell streams immediately while dynamic content fills in), and lets
  // React keep component state across client navigations via <Activity> —
  // which is what actually stops a loaded panel from re-showing its skeleton.
  cacheComponents: true,
  // Native gRPC/protobuf deps — keep them external instead of bundling them into
  // the server build (Next's recommended handling for such packages).
  serverExternalPackages: ["@google-analytics/data"],
  // The monthly PDF and every Open Graph image read these TTFs from disk at
  // runtime (`lib/og/render.tsx`), and a guide's card reads its MDX.
  // Turbopack traces the font folder from the computed path today; this pins
  // the files so a change in tracing can't ship a route without them.
  outputFileTracingIncludes: {
    "/api/cron/monthly-report": [
      "./node_modules/geist/dist/fonts/geist-sans/Geist-{Regular,SemiBold,Bold}.ttf",
      "./node_modules/geist/dist/fonts/geist-mono/GeistMono-{Regular,Bold}.ttf",
    ],
    "/og/*": OG_FONTS,
    "/**/opengraph-image*": [...OG_FONTS, "./content/docs/**/*.mdx"],
  },
  // PostHog ingests through this reverse proxy: the browser talks to first-party
  // `/relay/*` and Next forwards to PostHog's US ingestion/asset hosts. The
  // path is deliberately not `/ingest` (now on common blocklists). PostHog
  // needs the trailing slash kept.
  skipTrailingSlashRedirect: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The changelog pages were removed (the header now links to the GitHub
  // releases) but both URLs were in the sitemap and submitted to GSC — keep
  // them redirecting so indexed links don't 404.
  async redirects() {
    return [
      // Shared quiz results moved to their own URL so the quiz's metadata
      // could stay static (see lib/quiz/metadata.ts). Links already posted
      // keep their preview: the query string rides along.
      ...(["en", "es"] as const).map((locale) => ({
        source: ROUTES.quiz[locale],
        has: [{ type: "query" as const, key: "r" }],
        destination: ROUTES.quizResult[locale],
        permanent: true,
      })),
      { source: "/changelog", destination: "/download", permanent: true },
      {
        source: "/es/changelog",
        destination: "/es/descargar",
        permanent: true,
      },
      // The app's guide on the same topic is `metabolic-adaptation`; its
      // links to the web land on the web's one guide for it. Temporary, so
      // either side can still adopt the other's slug.
      ...(["/docs", "/es/docs"] as const).map((docs) => ({
        source: `${docs}/metabolic-adaptation`,
        destination: `${docs}/adaptive-thermogenesis`,
        permanent: false,
      })),
    ];
  },
  async rewrites() {
    return [
      {
        source: "/relay/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/relay/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  experimental: {
    // Tree-shake big barrel imports for smaller client bundles (better INP/LCP).
    optimizePackageImports: ["iconoir-react"],
  },
  async headers() {
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];
    // HSTS only in production: with includeSubDomains+preload, dev would pin
    // localhost to HTTPS for 2 years and break every http:// dev server.
    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [{ source: "/:path*", headers }];
  },
};

/**
 * Sentry build-time wrapping — uploads source maps + sourcemap the build.
 * The `authToken` is read from env at build time (set in Vercel); absent in
 * local `bun run dev` so the plugin just no-ops. `silent: !process.env.CI`
 * matches Sentry's recommendation: quiet locally, verbose in CI to make
 * upload failures visible.
 */
export default withSentryConfig(nextConfig, {
  org: "metri-ku",
  project: "javascript-nextjs",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Tree-shake Sentry's own debug logging out of the production bundle (smaller
  // client JS). Modern replacement for the deprecated `disableLogger` flag.
  webpack: { treeshake: { removeDebugLogging: true } },
  widenClientFileUpload: true,
  // Proxy browser → Sentry through a first-party route so ad blockers (which
  // blocklist `*.sentry.io`) don't drop error events — same trick as the
  // PostHog `/relay` rewrite. Routed under `/monitoring`.
  tunnelRoute: "/monitoring",
});
