import { expect, test } from "@playwright/test";

import { CALC_IDS, ROUTES, type RouteId } from "../lib/i18n/routes";

/**
 * Every public page, in both languages, on every browser in
 * `playwright.config.ts`: it must load, throw nothing and fit the screen, and
 * hand Googlebot its title and canonical in the HTML. The overflow check is
 * what catches a layout that only breaks on a phone.
 */

const PUBLIC_PAGES: RouteId[] = [
  "home",
  "tools",
  "docs",
  "download",
  "about",
  "privacy",
  "terms",
  "contact",
  "quiz",
  "signIn",
  "signUp",
  ...CALC_IDS,
];

/** Public, but kept out of the index on purpose (and out of the sitemap). */
const NOINDEX_BY_DESIGN = new Set<string>(
  (["signIn", "signUp"] as const).flatMap((id) => [
    ROUTES[id].en,
    ROUTES[id].es,
  ]),
);

const paths = PUBLIC_PAGES.flatMap((id) => [ROUTES[id].en, ROUTES[id].es]);

/** Googlebot runs JavaScript, so Next streams it dynamic metadata; the raw
 * HTML is what this checks. */
const GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

/** Vercel Analytics and Speed Insights only exist on a Vercel deployment. */
const VERCEL_ONLY = "/_vercel/";

for (const path of paths) {
  test(`loads cleanly: ${path}`, async ({ page }) => {
    const problems: string[] = [];
    page.on("pageerror", (error) => problems.push(`thrown: ${error.message}`));
    page.on("response", (response) => {
      if (response.status() >= 400 && !response.url().includes(VERCEL_ONLY))
        problems.push(`${response.status()}: ${response.url()}`);
    });
    page.on("console", (message) => {
      const text = message.text();
      // A failed load is already reported above, with its URL.
      if (
        message.type() !== "error" ||
        text.startsWith("Failed to load resource") ||
        text.includes(VERCEL_ONLY)
      )
        return;
      problems.push(`console: ${text}`);
    });

    const response = await page.goto(path, { waitUntil: "load" });
    expect(response?.status(), "HTTP status").toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, "page wider than the screen").toBeLessThanOrEqual(1);
    expect(problems).toEqual([]);
  });

  test(`Googlebot gets title and canonical in the HTML: ${path}`, async ({
    request,
  }) => {
    const html = await (
      await request.get(path, { headers: { "user-agent": GOOGLEBOT } })
    ).text();
    const head = html.slice(0, html.indexOf("</head>"));
    expect(head).toMatch(/<title>[^<]+<\/title>/);
    expect(head).toContain('rel="canonical"');
    if (!NOINDEX_BY_DESIGN.has(path)) expect(head).not.toContain("noindex");
  });
}

test("old shared-result links keep working, out of the index", async ({
  page,
}) => {
  await page.goto(`${ROUTES.quiz.en}?r=2.4.0.1`);
  expect(new URL(page.url()).pathname).toBe(ROUTES.quizResult.en);
  expect(new URL(page.url()).searchParams.get("r")).toBe("2.4.0.1");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
