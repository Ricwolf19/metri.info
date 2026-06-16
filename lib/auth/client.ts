"use client";

import { createAuthClient } from "better-auth/react";

/**
 * No `baseURL` on purpose: the client then resolves to `window.location.origin`,
 * so every auth call is SAME-ORIGIN with the page the user is on. Passing an
 * absolute URL (e.g. the apex `metri.info`) while the user is on `www.metri.info`
 * made each request cross-origin → it hit the www↔apex canonical 301 → the CORS
 * preflight failed ("Redirect is not allowed for a preflight request") and the
 * sign-in/up spinner hung forever. Same-origin sidesteps CORS entirely.
 */
export const authClient = createAuthClient();

export const { signOut, useSession } = authClient;
