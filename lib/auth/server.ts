import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";

import { captureServer } from "@/lib/analytics/posthog-server";
import { verifyRecaptcha } from "@/lib/captcha/verify";
import { db } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";
import {
  renderResetPasswordEmail,
  renderVerifyEmail,
} from "@/lib/emails/render";
import { event } from "@/lib/log/logger";
import { siteUrl } from "@/lib/utils";

// Resend's shared sender (test mode) — no domain verification needed; swap via AUTH_FROM_EMAIL / CONTACT_FROM_EMAIL in production.
const RESET_FROM = "Metri <onboarding@resend.dev>";
const VERIFY_FROM = "Metri <onboarding@resend.dev>";

/**
 * Hardcoded rate-limit caps — no `.env` plumbing required for a deploy.
 * Edit + commit to bump temporarily (e.g. during prod pen-testing of signup).
 * Values follow Better Auth's `(window in seconds, max requests)` shape.
 */
const RATE_LIMITS = {
  signup: { window: 60 * 60, max: 3 }, // 3 signups / hour / IP
  signin: { window: 60 * 5, max: 10 }, // 10 signins / 5min / IP
  forgot: { window: 60 * 60, max: 3 }, // 3 forgot-password / hour / IP
  reset: { window: 60 * 60, max: 5 }, // 5 resets / hour / IP
  verify: { window: 60 * 60, max: 10 }, // 10 verify-email clicks / hour / IP
  default: { window: 60, max: 100 }, // any other auth route
} as const;

/** Args for the auth-email helpers. */
type SendAuthEmailArgs = {
  user: { email: string; name?: string | null };
  url: string;
};

/**
 * Send a transactional email via Resend. **Never throws** — failures are
 * logged with a stable `[auth]` prefix so we can grep Vercel logs after a
 * "the user didn't get the email" report. Better Auth swallows the throw
 * anyway (the user row is already committed), so propagating only promises
 * silent drops; an explicit log line is the only way to find the missing
 * message later.
 *
 * Returns `{ ok, id, error }` so the caller can attach the Resend `id` to
 * PostHog / structured logs without re-deriving it.
 */
const deliverAuthEmail = async (
  args: SendAuthEmailArgs,
  rendered: { html: string; text: string },
  subject: string,
  fromOverride: string,
  missingKeyLog: string,
): Promise<{ ok: boolean; id?: string; error?: string }> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    event.error("auth.email.send-skipped", {
      reason: "RESEND_API_KEY_missing",
      kind: missingKeyLog,
      to: args.user.email,
      subject,
    });
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: fromOverride,
    to: args.user.email,
    subject,
    html: rendered.html,
    text: rendered.text,
  });
  if (error) {
    event.error("auth.email.send-failed", {
      subject,
      to: args.user.email,
      from: fromOverride,
      resendError: error.message,
    });
    // Surface to Sentry so the failure is visible in the dashboard; the
    // toast/console-log isn't enough when you can't repro the user's path.
    Sentry.captureException(
      new Error(`auth email send failed: ${error.message}`),
      {
        tags: { flow: "auth.email", subject },
        extra: { to: args.user.email, from: fromOverride },
      },
    );
    return { ok: false, error: error.message };
  }
  if (data?.id) {
    event.info("auth.email.send-ok", {
      subject,
      to: args.user.email,
      from: fromOverride,
      resendId: data.id,
    });
    return { ok: true, id: data.id };
  }
  event.warn("auth.email.send-ok-but-no-data", {
    subject,
    to: args.user.email,
    from: fromOverride,
  });
  return { ok: false, error: "no data returned" };
};

/**
 * Verification email for a freshly-created account. Better Auth invokes this
 * from `databaseHooks.user.create.after` once the row exists with
 * `emailVerified: false`. `deliverAuthEmail` never throws — failures land in
 * Vercel logs under `[auth] send-failed` so we can debug "user didn't get
 * the email" reports without having to ask the user to dig through their
 * inbox tab.
 */
const sendVerificationEmail = async ({
  user: target,
  url,
}: SendAuthEmailArgs): Promise<void> => {
  if (process.env.NODE_ENV !== "production") {
    event.info("auth.email.verify-link", {
      env: process.env.NODE_ENV ?? "dev",
      to: target.email,
      url,
    });
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
    "verification email not sent — refusing to create unverified account",
  );
};

/**
 * Password-reset email. `deliverAuthEmail` logs failures instead of throwing,
 * keeping this handler symmetric with the verification path so debug logs
 * live in the same `[auth]` namespace.
 */
const sendResetPassword = async ({
  user: target,
  url,
}: SendAuthEmailArgs): Promise<void> => {
  if (process.env.NODE_ENV !== "production") {
    event.info("auth.email.reset-link", {
      env: process.env.NODE_ENV ?? "dev",
      to: target.email,
      url,
    });
  }
  const rendered = await renderResetPasswordEmail({
    name: target.name,
    url,
    expiresIn: "1 hour",
  });
  await deliverAuthEmail(
    { user: target, url },
    rendered,
    "Reset your Metri password",
    process.env.AUTH_FROM_EMAIL ?? process.env.CONTACT_FROM_EMAIL ?? RESET_FROM,
    "password-reset email not sent",
  );
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
  // In-memory in v1 — switch to `storage: "database"` when going multi-region.
  rateLimit: {
    enabled: process.env.BETTER_AUTH_RATE_LIMIT_ENABLED !== "false",
    window: RATE_LIMITS.default.window,
    max: RATE_LIMITS.default.max,
    customRules: {
      "/sign-up/email": RATE_LIMITS.signup,
      "/sign-in/email": RATE_LIMITS.signin,
      "/forget-password": RATE_LIMITS.forgot,
      "/reset-password": RATE_LIMITS.reset,
      "/verify-email": RATE_LIMITS.verify,
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
