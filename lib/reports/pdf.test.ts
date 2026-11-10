import { describe, expect, it } from "vitest";

import { demoReportInput } from "./fixtures";
import { buildMonthlyReport } from "./monthly";
import { renderMonthlyReportPdf } from "./pdf";

const GUIDE = "https://metri.info/docs/progressive-overload";

const render = (
  report: ReturnType<typeof buildMonthlyReport>,
  locale: "en" | "es",
) =>
  renderMonthlyReportPdf({
    locale,
    report,
    name: "Ana",
    imperial: locale === "es",
    customNames: {},
    guideUrl: GUIDE,
  });

const isPdf = (buffer: Buffer) => buffer.subarray(0, 5).toString() === "%PDF-";

describe("renderMonthlyReportPdf", () => {
  it.each(["en", "es"] as const)(
    "renders a full report in %s",
    async (locale) => {
      const pdf = await render(buildMonthlyReport(demoReportInput()), locale);
      expect(isPdf(pdf)).toBe(true);
      expect(pdf.byteLength).toBeGreaterThan(10_000);
    },
  );

  it("copes with a month that has only weigh-ins", async () => {
    const demo = demoReportInput();
    const report = buildMonthlyReport({
      ...demo,
      sessions: [],
      sets: [],
      food: [],
      tape: [],
      goal: null,
    });
    expect(isPdf(await render(report, "en"))).toBe(true);
  });
});
