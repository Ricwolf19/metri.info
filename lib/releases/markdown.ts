/**
 * Minimal markdown → HTML for release-please changelogs in email. Covers what
 * release-please emits — headings, `*`/`-` bullet lists (nesting flattened),
 * paragraphs, `[links](https://…)`, `**bold**` and `` `code` `` — and nothing
 * else. Email clients strip `<style>`, so every element carries its inline
 * style from `styles`.
 *
 * Safety: the whole source is HTML-escaped BEFORE any markup is added, so raw
 * HTML in the changelog renders as text; links are only produced for http(s)
 * URLs, which the escaping has already made attribute-safe.
 */

type Styles = Partial<
  Record<"h2" | "h3" | "p" | "ul" | "li" | "a" | "code", string>
>;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const attr = (style: string | undefined): string =>
  style ? ` style="${style}"` : "";

const inline = (text: string, styles: Styles): string =>
  escapeHtml(text)
    .replace(/`([^`]+)`/g, `<code${attr(styles.code)}>$1</code>`)
    .replace(
      // The URL excludes `<`, `*` and backticks so the code/bold passes can
      // never splice markup into an href.
      /\[([^\]]+)\]\((https?:\/\/[^\s)<*`]+)\)/g,
      `<a href="$2"${attr(styles.a)}>$1</a>`,
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const ITEM_RE = /^\s*[*-]\s+(.*)$/;

export const renderReleaseNotes = (
  markdown: string,
  styles: Styles = {},
): string => {
  const out: string[] = [];
  let list: string[] = [];
  let paragraph: string[] = [];

  const flushList = () => {
    if (list.length === 0) return;
    const items = list.map((item) => `<li${attr(styles.li)}>${item}</li>`);
    out.push(`<ul${attr(styles.ul)}>${items.join("")}</ul>`);
    list = [];
  };
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    out.push(`<p${attr(styles.p)}>${paragraph.join(" ")}</p>`);
    paragraph = [];
  };

  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    const heading = HEADING_RE.exec(line);
    const item = ITEM_RE.exec(line);
    if (heading) {
      flushList();
      flushParagraph();
      // h1–h2 → h2 and h3+ → h3: the email already owns the page title.
      const level = heading[1].length <= 2 ? "h2" : "h3";
      out.push(
        `<${level}${attr(styles[level])}>${inline(heading[2], styles)}</${level}>`,
      );
    } else if (item) {
      flushParagraph();
      list.push(inline(item[1], styles));
    } else if (line.trim() === "") {
      flushList();
      flushParagraph();
    } else {
      flushList();
      paragraph.push(inline(line.trim(), styles));
    }
  }
  flushList();
  flushParagraph();
  return out.join("\n");
};
