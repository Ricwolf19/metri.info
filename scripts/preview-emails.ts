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
