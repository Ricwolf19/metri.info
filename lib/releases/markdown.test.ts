import { describe, expect, it } from "vitest";

import { renderReleaseNotes } from "./markdown";

describe("renderReleaseNotes", () => {
  it("renders a release-please changelog: headings, bullets, links, bold", () => {
    const html = renderReleaseNotes(
      [
        "## [1.12.0](https://github.com/Ricwolf19/metri/compare/a...b) (2026-09-28)",
        "",
        "",
        "### Features",
        "",
        "* **training:** plate math ([abc1234](https://github.com/Ricwolf19/metri/commit/abc1234))",
        "* rest timer `v2`",
      ].join("\n"),
    );
    expect(html).toContain(
      '<h2><a href="https://github.com/Ricwolf19/metri/compare/a...b">1.12.0</a> (2026-09-28)</h2>',
    );
    expect(html).toContain("<h3>Features</h3>");
    expect(html).toContain(
      '<ul><li><strong>training:</strong> plate math (<a href="https://github.com/Ricwolf19/metri/commit/abc1234">abc1234</a>)</li><li>rest timer <code>v2</code></li></ul>',
    );
  });

  it("escapes raw HTML instead of rendering it", () => {
    const html = renderReleaseNotes(
      '<script>alert("x")</script>\n* <img src=x onerror=alert(1)>',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).toContain("<li>&lt;img src=x onerror=alert(1)&gt;</li>");
  });

  it("only links http(s) URLs and keeps quotes out of the attribute", () => {
    const html = renderReleaseNotes(
      '[bad](javascript:alert(1)) [ok](https://x.dev/a"onmouseover="b)',
    );
    expect(html).not.toContain('href="javascript');
    expect(html).toContain("[bad](javascript:alert(1))");
    expect(html).toContain(
      '<a href="https://x.dev/a&quot;onmouseover=&quot;b">ok</a>',
    );
  });

  it("never splices bold or code markup into an href", () => {
    const html = renderReleaseNotes(
      "[**x](https://a.dev/**) [y](https://b.dev/`c`)",
      { a: "color:red", code: "font:mono" },
    );
    expect(html).not.toMatch(/href="[^"]*</);
    expect(html).not.toContain("<a href");
  });

  it("applies inline styles and groups paragraphs", () => {
    const html = renderReleaseNotes("line one\nline two\n\n- item", {
      p: "color:red",
      li: "margin:0",
    });
    expect(html).toBe(
      '<p style="color:red">line one line two</p>\n<ul><li style="margin:0">item</li></ul>',
    );
  });
});
