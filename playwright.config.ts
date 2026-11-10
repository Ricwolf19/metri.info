import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Cross-browser smoke: `bun run test:browsers`. Runs against a production
 * build, because what ships to Firefox and Safari is the compiled CSS and JS.
 * Add `--project=webkit` (or any name below) to run just one.
 *
 * The server's env wins over `.env`, so nothing here can touch the real
 * database, count as real analytics traffic or upload source maps. Every
 * browser shares one IP here, so Better Auth's rate limit is switched off.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "android", use: { ...devices["Pixel 7"] } },
    { name: "iphone", use: { ...devices["iPhone 14"] } },
  ],
  webServer: {
    command: `bun run build && bun run start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: "postgresql://e2e:e2e@127.0.0.1:5/e2e",
      BETTER_AUTH_SECRET: "e2e-only-secret-e2e-only-secret-e2e",
      RESEND_API_KEY: "re_e2e",
      BETTER_AUTH_RATE_LIMIT_ENABLED: "false",
      RECAPTCHA_SECRET_KEY: "e2e",
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "e2e",
      NEXT_PUBLIC_APP_URL: `http://localhost:${PORT}`,
      NEXT_PUBLIC_POSTHOG_KEY: "",
      NEXT_PUBLIC_GA_ID: "",
      NEXT_PUBLIC_SENTRY_DSN: "",
      SENTRY_DSN: "",
      SENTRY_AUTH_TOKEN: "",
      GITHUB_CLIENT_ID: "",
      GITHUB_CLIENT_SECRET: "",
      GOOGLE_CLIENT_ID: "",
      GOOGLE_CLIENT_SECRET: "",
    },
  },
});
