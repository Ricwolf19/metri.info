/**
 * Environment-variable gate (wired into `instrumentation.ts`).
 *
 * Severity:
 *  - **production** → missing required var THROWS (app won't serve).
 *  - **development** → missing required var WARNS (bundled calculators/docs still run without a DB).
 *  - **misconfigured OAuth pair** → THROWS in any env (half a credential pair is always a bug).
 *  - **`next build`** → no-op (static generation runs with no secrets).
 *
 * A misconfigured prod deploy fails loudly here instead of silently degrading
 * (e.g. fail-OPEN sign-up).
 */

const isProd = process.env.NODE_ENV === "production";

/** Vars required for production. Missing any in prod is fatal. */
const REQUIRED: ReadonlyArray<readonly [key: string, why: string]> = [
  ["DATABASE_URL", "Postgres connection — accounts, saved history, admin"],
  ["BETTER_AUTH_SECRET", "signs session cookies & verification tokens"],
  ["RESEND_API_KEY", "sends email-verification & password-reset mail"],
  [
    "RECAPTCHA_SECRET_KEY",
    "server-side bot check on sign-up — WITHOUT it the captcha is fail-open",
  ],
  [
    "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
    "client reCAPTCHA token — sign-up is unprotected without it",
  ],
];

/** All-or-nothing OAuth credential pairs (half-configured = bug). */
const PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
  ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
];

const isSet = (key: string): boolean => !!process.env[key]?.trim();

/** Throws on missing required vars in prod (or any half-configured OAuth pair); warns in dev; no-op during build. */
export const validateEnv = (): void => {
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const fatal: string[] = [];
  const warnings: string[] = [];

  for (const [key, why] of REQUIRED) {
    if (!isSet(key)) (isProd ? fatal : warnings).push(`${key} — ${why}`);
  }

  for (const [a, b] of PAIRS) {
    const ha = isSet(a);
    const hb = isSet(b);
    if (ha !== hb) {
      const present = ha ? a : b;
      const missing = ha ? b : a;
      fatal.push(`${missing} — must be set together with ${present}`);
    }
  }

  if (warnings.length) {
    console.warn(
      `\n[env] ${warnings.length} recommended var(s) missing (dev — app still runs):\n  - ${warnings.join("\n  - ")}\n`,
    );
  }

  if (fatal.length) {
    throw new Error(
      `\n[env] Refusing to start — ${fatal.length} required var(s) missing or misconfigured:\n  - ${fatal.join("\n  - ")}\n\n` +
        `Set them in your environment (Vercel project settings or .env) and restart.\n`,
    );
  }
};
