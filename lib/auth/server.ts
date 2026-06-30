import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { Resend } from "resend";

import { captureServer } from "@/lib/analytics/posthog-server";
import { verifyRecaptcha } from "@/lib/captcha/verify";
import { db } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";
import {
  renderResetPasswordEmail,
  renderVerifyEmail,
} from "@/lib/emails/render";
import { siteUrl } from "@/lib/utils";

// Resend's shared sender (test mode) — no domain verification needed; swap via AUTH_FROM_EMAIL / CONTACT_FROM_EMAIL in production.
const RESET_FROM = "Metri <onboarding@resend.dev>";
const VERIFY_FROM = "Metri <onboarding@resend.dev>";

/** Args for the auth-email helpers. */
type SendAuthEmailArgs = {
  user: { email: string; name?: string | null };
  url: string;
};

const deliverAuthEmail = async (
  args: SendAuthEmailArgs,
  rendered: { html: string; text: string },
  subject: string,
  fromOverride: string,
  missingKeyLog: string,
): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(missingKeyLog);
    throw new Error("RESEND_API_KEY not configured");
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromOverride,
    to: args.user.email,
    subject,
    html: rendered.html,
    text: rendered.text,
  });
  if (error) {
    console.error(`[auth] failed to send email "${subject}":`, error.message);
    throw error;
  }
};

/**
 * Verification email for a freshly-created account. Better Auth invokes this
 * from `databaseHooks.user.create.after` once the row exists with
 * `emailVerified: false`. Throws on RESEND errors so failures surface instead
 * of producing silently-unverified rows.
 */
const sendVerificationEmail = async ({
  user: target,
  url,
}: SendAuthEmailArgs): Promise<void> => {
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[auth] verification link (${process.env.NODE_ENV ?? "dev"}) → ${target.email} : ${url}`,
    );
  }
  const rendered = await renderVerifyEmail({
    name: target.name,
    url,
    expiresIn: "1 hour",
  });
  await deliverAuthEmail(
    { user: target, url },
    rendered,
    "Confirm your Metri email",
    process.env.AUTH_FROM_EMAIL ??
      process.env.CONTACT_FROM_EMAIL ??
      VERIFY_FROM,
    "[auth] RESEND_API_KEY not set — refusing to create unverified account.",
  );
};

/**
 * Password-reset email. Skips with a warning when RESEND_API_KEY is unset so
 * dev / DB-less builds still run; production must set the key (the contact
 * form already enforces it).
 */
const sendResetPassword = async ({
  user: target,
  url,
}: SendAuthEmailArgs): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[auth] RESEND_API_KEY not set — skipping password-reset email.",
    );
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[auth] reset link (${process.env.NODE_ENV ?? "dev"}) → ${target.email} : ${url}`,
    );
  }
  const rendered = await renderResetPasswordEmail({
    name: target.name,
    url,
    expiresIn: "1 hour",
  });
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from:
      process.env.AUTH_FROM_EMAIL ??
      process.env.CONTACT_FROM_EMAIL ??
      RESET_FROM,
    to: target.email,
    subject: "Reset your Metri password",
    html: rendered.html,
    text: rendered.text,
  });
  if (error) {
    console.error("[auth] failed to send password-reset email:", error.message);
  }
};

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
 * Origins allowed to call the auth API. Better Auth rejects untrusted Origins;
 * we list apex + `www` (the canonical 301 between them is what originally broke
 * sign-in), localhost in dev, and any comma-separated
 * `BETTER_AUTH_TRUSTED_ORIGINS` overrides.
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
 * Cookie domain for cross-subdomain sessions. Returns `.apex` (e.g.
 * `.metri.info`) so the session cookie flows across the apex↔www 308.
 * Null on localhost / raw IPs where a Domain attr would break dev cookies.
 */
const cookieDomain = (() => {
  try {
    const host = new URL(siteUrl).hostname;
    if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;
    return `.${host.replace(/^www\./, "")}`;
  } catch {
    return null;
  }
})();

/**
 * Before-hook: reCAPTCHA gate on `/sign-up/email` only — sign-in stays captcha-free
 * so returning users aren't slowed, and friction lands on the surface that's
 * actually being spammed.
 *
 * IMPORTANT: short-circuit by THROWING `APIError`, never by returning a `Response`.
 * Better Auth's hook runner reads `result.response` off the return value; a raw
 * `Response` has no `.response`, so it's silently dropped and the sign-up proceeds —
 * the captcha wouldn't block anything. A thrown `APIError` is caught and converted
 * to a real HTTP error.
 */
const beforeAuthHook = async (inputContext: {
  request?: Request;
}): Promise<void> => {
  const { request } = inputContext;
  if (!request) return;
  const url = new URL(request.url);
  if (!url.pathname.endsWith("/sign-up/email")) return;

  const token =
    request.headers.get("x-recaptcha-token") ??
    request.headers.get("X-Recaptcha-Token");
  const result = await verifyRecaptcha(token);
  if (!result.ok) {
    throw new APIError("FORBIDDEN", {
      // `code` is surfaced to the client as `error.code`; SignUpForm matches it.
      code: "captcha_failed",
      message: `captcha_failed: ${result.reason}`,
    });
  }
};

/**
 * Better Auth server config (Drizzle/Neon). Builds without env vars; sign-in
 * works once `BETTER_AUTH_SECRET` + `DATABASE_URL` are set. OAuth providers
 * turn on only when their client id/secret pair is present.
 */
export const auth = betterAuth({
  baseURL: siteUrl,
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword,
  },
  emailVerification: {
    sendVerificationEmail,
    autoSignInAfterVerification: true,
  },
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  socialProviders,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
      // Trusted providers verify the email themselves, so allow linking to a pre-existing unverified local account — otherwise a bootstrap admin (emailVerified=false) hits `account_not_linked` when signing in with the same Google/GitHub email.
      requireLocalEmailVerified: false,
    },
  },
  // Share the session cookie across apex + www so the canonical 308 between them never drops the session.
  ...(cookieDomain && {
    advanced: {
      crossSubDomainCookies: { enabled: true, domain: cookieDomain },
    },
  }),
  user: {
    additionalFields: {
      role: { type: "string", input: false, required: false },
    },
  },
  // Rate limits: stay generous for ordinary visitors but throttled so bulk sign-up hits 429 before creating accounts. In-memory in v1 — switch to `storage: "database"` when going multi-region.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-up/email": { window: 60 * 60, max: 3 },
      "/sign-in/email": { window: 60 * 5, max: 10 },
      "/forget-password": { window: 60 * 60, max: 3 },
      "/reset-password": { window: 60 * 60, max: 5 },
      "/verify-email": { window: 60 * 60, max: 10 },
    },
  },
  hooks: {
    before: beforeAuthHook,
  },
  databaseHooks: {
    user: {
      create: {
        // Funnel's final step — fires once per new account. Captured server-side so email + social signups count uniformly; `method` is a best-effort read of the endpoint path (`/callback/<provider>` vs email).
        after: async (newUser, context) => {
          const path = (context as { path?: string } | null)?.path ?? "";
          const method = path.includes("callback")
            ? (path.split("/").pop() ?? "social")
            : "email";
          await captureServer(newUser.id, "signup_completed", { method });
        },
      },
    },
  },
});
