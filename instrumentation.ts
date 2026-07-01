/**
 * Next.js instrumentation — runs once per server boot (dev / prod / cold start).
 *
 * - **Node runtime** (Server Components, Route Handlers, Server Actions):
 *   validates required env vars (fail-closed in prod), then initialises the
 *   Sentry Node SDK via `sentry.server.config.ts`.
 * - **Edge runtime** (middleware/proxy in Next.js 16+): initialises the Sentry
 *   Edge SDK.
 * - **`onRequestError`**: surfaces every server-side render / action error to
 *   Sentry — implemented per the [official Sentry / Next.js guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#register-server-side-sdk).
 */
import type { Instrumentation } from "next";
import * as Sentry from "@sentry/nextjs";

export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("./lib/env");
    validateEnv();
    await import("./sentry.server.config").catch(() => undefined);
    return;
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config").catch(() => undefined);
  }
};

export const onRequestError: Instrumentation.onRequestError = (
  err,
  request,
  context,
) => Sentry.captureRequestError(err, request, context);
