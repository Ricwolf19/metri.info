/**
 * Render every transactional email (and the monthly PDF) into
 * `./tmp/email-preview/*` for local inspection without starting a dev server.
 *
 * Usage:  bun scripts/preview-emails.ts
 * Output: tmp/email-preview/<name>.html + .txt
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  renderMonthlyReportEmail,
  renderMonthlyTipsEmail,
  renderReleaseEmail,
  renderResetPasswordEmail,
  renderVerifyEmail,
} from "../lib/emails/render";
import { demoReportInput } from "../lib/reports/fixtures";
import { buildMonthlyReport } from "../lib/reports/monthly";
import { renderMonthlyReportPdf } from "../lib/reports/pdf";
import { buildTipsEdition } from "../lib/reports/tips";

const OUT_DIR = "tmp/email-preview";

const DEMO_URL = "https://metri.info/api/auth/verify-email?token=ABCD-1234";
const PERIOD = "2026-10";
const GUIDE_URL = "https://metri.info/docs/progressive-overload";
const report = buildMonthlyReport(demoReportInput(PERIOD));

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
        downloadPageUrl: "https://metri.info/download",
        unsubscribeUrl: "https://metri.info/unsubscribe?token=DEMO",
      }),
  })),
  ...(["en", "es"] as const).map((locale) => ({
    file: `monthly-report-${locale}`,
    run: () =>
      renderMonthlyReportEmail({
        locale,
        report,
        imperial: false,
        customNames: {},
        bodyUrl: "https://metri.info/account/body",
        guideUrl: GUIDE_URL,
        unsubscribeUrl:
          "https://metri.info/unsubscribe?token=DEMO&list=monthly",
      }),
  })),
  ...(["en", "es"] as const).flatMap((locale) =>
    (["no_data", "quiet_month"] as const).map((reason) => ({
      file: `monthly-tips-${reason}-${locale}`,
      run: () =>
        renderMonthlyTipsEmail({
          locale,
          period: PERIOD,
          edition: buildTipsEdition(PERIOD, {
            reason,
            calculations: reason === "no_data" ? 0 : 4,
            topCalculator: reason === "no_data" ? null : "tdee",
            quizScores: null,
            latestVersion: "1.17.0",
          }),
          unsubscribeUrl:
            "https://metri.info/unsubscribe?token=DEMO&list=monthly",
        }),
    })),
  ),
];

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });
  for (const c of cases) {
    const { html, text } = await c.run();
    await writeFile(join(OUT_DIR, `${c.file}.html`), html);
    await writeFile(join(OUT_DIR, `${c.file}.txt`), text);
    console.log(`wrote ${c.file}.html + ${c.file}.txt`);
  }
  for (const locale of ["en", "es"] as const) {
    const pdf = await renderMonthlyReportPdf({
      locale,
      report,
      name: "Ricardo",
      imperial: false,
      customNames: {},
      guideUrl: GUIDE_URL,
    });
    await writeFile(join(OUT_DIR, `monthly-report-${locale}.pdf`), pdf);
    console.log(`wrote monthly-report-${locale}.pdf`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
