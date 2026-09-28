/**
 * Render every transactional email into `./tmp/email-preview/*` for local
 * inspection without starting a dev server.
 *
 * Usage:  bun scripts/preview-emails.ts
 * Output: tmp/email-preview/<name>.html + .txt
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  renderReleaseEmail,
  renderResetPasswordEmail,
  renderVerifyEmail,
} from "../lib/emails/render";

const OUT_DIR = "tmp/email-preview";

const DEMO_URL = "https://metri.info/api/auth/verify-email?token=ABCD-1234";

const cases = [
  {
    file: "verify-email",
    run: () =>
      renderVerifyEmail({
        name: "Ricardo",
        url: DEMO_URL,
        expiresIn: "1 hour",
      }),
  },
  {
    file: "verify-email-no-name",
    run: () => renderVerifyEmail({ url: DEMO_URL, expiresIn: "1 hour" }),
  },
  {
    file: "reset-password",
    run: () =>
      renderResetPasswordEmail({
        name: "Ricardo",
        url: "https://metri.info/api/auth/reset-password?token=EFGH-5678",
        expiresIn: "1 hour",
      }),
  },
  ...(["en", "es"] as const).map((locale) => ({
    file: `release-${locale}`,
    run: () =>
      renderReleaseEmail({
        locale,
        version: "1.12.0",
        notes: [
          "## [1.12.0](https://github.com/Ricwolf19/metri/compare/metri-v1.11.0...metri-v1.12.0) (2026-09-28)",
          "",
          "### Features",
          "",
          "* **training:** plate math in the set input ([abc1234](https://github.com/Ricwolf19/metri/commit/abc1234))",
          "",
          "### Bug Fixes",
          "",
          "* **onboarding:** convert body weight with `lbToKg`",
        ].join("\n"),
        apkUrl:
          "https://github.com/Ricwolf19/metri/releases/download/metri-v1.12.0/metri-1.12.0.apk",
        downloadPageUrl: "https://metri.info/download",
        unsubscribeUrl: "https://metri.info/unsubscribe?token=DEMO",
      }),
  })),
] as const;

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });
  for (const c of cases) {
    const { html, text } = await c.run();
    await writeFile(join(OUT_DIR, `${c.file}.html`), html);
    await writeFile(join(OUT_DIR, `${c.file}.txt`), text);
    console.log(`wrote ${c.file}.html + ${c.file}.txt`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
