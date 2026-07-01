import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  // Native gRPC/protobuf deps — keep them external instead of bundling them into
  // the server build (Next's recommended handling for such packages).
  serverExternalPackages: ["@google-analytics/data"],
  // PostHog ingests through this reverse proxy: the browser talks to first-party
  // `/ingest/*` (which ad blockers don't blocklist) and Next forwards to
  // PostHog's US ingestion/asset hosts. PostHog needs the trailing slash kept.
  skipTrailingSlashRedirect: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  experimental: {
    // Tree-shake big barrel imports for smaller client bundles (better INP/LCP).
    optimizePackageImports: ["iconoir-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
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
  // PostHog `/ingest` rewrite. Routed under `/monitoring`.
  tunnelRoute: "/monitoring",
});
