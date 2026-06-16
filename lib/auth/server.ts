import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";
import { siteUrl } from "@/lib/utils";

/** Build the socialProviders map from whichever OAuth env vars are present. */
const socialProviders: NonNullable<
  Parameters<typeof betterAuth>[0]["socialProviders"]
> = {};

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  };
}
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

/**
 * Origins allowed to call the auth API. Better Auth rejects requests whose
 * Origin isn't trusted; by default only `baseURL`'s origin counts. We must list
 * BOTH the apex and `www` host of the site (the canonical 301 between them is
 * exactly what broke sign-in), plus localhost in dev, plus any explicit
 * comma-separated overrides via BETTER_AUTH_TRUSTED_ORIGINS.
 */
const trustedOrigins = (() => {
  const origins = new Set<string>();
  try {
    const { protocol, host } = new URL(siteUrl);
    const apex = host.replace(/^www\./, "");
    origins.add(`${protocol}//${apex}`);
    origins.add(`${protocol}//www.${apex}`);
  } catch {
    // siteUrl unparseable — rely on env override + localhost below.
  }
  for (const raw of process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? []) {
    const origin = raw.trim().replace(/\/$/, "");
    if (origin) origins.add(origin);
  }
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
  }
  return [...origins];
})();

/**
 * Better Auth server config. Self-hosted on our Neon DB via Drizzle. Builds
 * fine without env vars (no connection at construction); sign-in works once
 * BETTER_AUTH_SECRET + DATABASE_URL are set. Each OAuth provider turns on only
 * when its client id/secret pair is present.
 */
export const auth = betterAuth({
  baseURL: siteUrl,
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: { enabled: true },
  socialProviders,
  user: {
    // Expose `role` on the session (UI gating). `input: false` keeps it off the
    // sign-up payload, so it can never be self-assigned — only the bootstrap
    // script / DB grants admin. Authoritative checks still re-query the DB.
    additionalFields: {
      role: { type: "string", input: false, required: false },
    },
  },
});
