import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth/server";

/**
 * Per-request memoized session read. `React.cache` dedupes repeated calls within
 * a single render pass, so several guards/components asking for the session in
 * one request resolve the cookie (and DB, on a cookieCache miss) only once. This
 * complements Better Auth's `session.cookieCache`: cookieCache skips the DB hop
 * across requests, `React.cache` skips the repeated work inside one request.
 */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
