import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";

import { db } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";
import { siteUrl } from "@/lib/utils";

/** Resend's shared sender (test mode) works without domain verification; swap
 * to a verified sender via AUTH_FROM_EMAIL / CONTACT_FROM_EMAIL in production. */
const RESET_FROM = "Metri <onboarding@resend.dev>";

/**
 * Email the password-reset link via Resend, reusing the same client/setup as the
 * contact form. When RESEND_API_KEY isn't configured we log a warning and return
 * (never throw) so local dev and DB-less builds keep working — mirrors the
 * skip-on-missing-key behaviour of the contact flow.
 */
const sendResetPassword = async ({
  user: target,
  url,
}: {
  user: { email: string; name?: string | null };
  url: string;
}): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[auth] RESEND_API_KEY not set — skipping password-reset email.",
    );
    return;
  }

  const resend = new Resend(apiKey);
  const greeting = target.name ? `Hi ${target.name},` : "Hi,";
  const { error } = await resend.emails.send({
    from:
      process.env.AUTH_FROM_EMAIL ??
      process.env.CONTACT_FROM_EMAIL ??
      RESET_FROM,
    to: target.email,
    subject: "Reset your Metri password",
    text: [
      greeting,
      "",
      "We received a request to reset your Metri password.",
      "Open the link below to choose a new one (it expires in 1 hour):",
      "",
      url,
      "",
      "If you didn't request this, you can safely ignore this email.",
      "",
      "— Metri",
    ].join("\n"),
  });
  if (error) {
    console.error("[auth] failed to send password-reset email:", error.message);
  }
};

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
  } catch {}
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
  emailAndPassword: { enabled: true, sendResetPassword },
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  socialProviders,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false, required: false },
    },
  },
});
