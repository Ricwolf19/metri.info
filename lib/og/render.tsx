import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";

import { markSvg } from "@/lib/brand/mark";
import { siteUrl } from "@/lib/utils";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/** The palette for images, which can't read CSS variables: the `:root`
 * tokens of `app/globals.css`, copied. */
export const OG_COLOR = {
  bg: "rgb(9 9 11)", // ink-900
  surface: "rgb(18 18 21)", // ink-800
  raised: "rgb(32 32 36)", // ink-700
  border: "rgb(42 42 47)", // ink-600
  text: "rgb(245 245 247)", // ink-50
  soft: "rgb(212 212 216)", // ink-200
  muted: "rgb(161 161 170)", // ink-300
  faint: "rgb(124 124 134)", // ink-500
  brand: "rgb(190 248 43)",
} as const;

/** A page's address as the footer prints it: `metri.info/docs/tdee`. */
export const ogUrl = (path: string) =>
  `${siteUrl.replace(/^https?:\/\//, "")}${path === "/" ? "" : path}`;

/** Metri dumbbell mark (lime glyph) as a data URI — Satori rasterizes `<img>`
 * data URIs reliably, unlike inline SVG with nested transforms. */
const MARK_DATA_URI = `data:image/svg+xml,${encodeURIComponent(markSvg("#bef82b"))}`;

const fontFile = (dir: string, file: string) =>
  readFileSync(
    path.join(process.cwd(), "node_modules/geist/dist/fonts", dir, file),
  );

type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700 | 500;
  style: "normal";
};
let fonts: OgFont[] | null = null;

/** Geist for words and Geist Mono for the machine voice, as on the site (the
 * renderer needs TTFs, which the `geist` package ships next to the WOFF2s;
 * `outputFileTracingIncludes` deploys them with every image route). Read
 * once per server, synchronously: an uncached async read would make every
 * image route dynamic under Cache Components, so none could be prerendered. */
export const ogFonts = (): OgFont[] => {
  fonts ??= [
    {
      name: "Geist",
      data: fontFile("geist-sans", "Geist-Regular.ttf"),
      weight: 400,
      style: "normal",
    },
    {
      name: "Geist",
      data: fontFile("geist-sans", "Geist-Bold.ttf"),
      weight: 700,
      style: "normal",
    },
    {
      name: "Geist Mono",
      data: fontFile("geist-mono", "GeistMono-Medium.ttf"),
      weight: 500,
      style: "normal",
    },
  ];
  return fonts;
};

/** A string cut to at most `max` characters, at the last whole word, with
 * an ellipsis (Satori has no line clamp). */
export const clip = (text: string, max: number) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const word = cut.lastIndexOf(" ");
  return `${(word > 0 ? cut.slice(0, word) : cut).replace(/[\s,.;:·—-]+$/, "")}…`;
};

/** The mark and the name, top left of every card, with the card's subject
 * after them when it has one ("· Knowledge check"). */
export const OgBrand = ({ section }: { section?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={MARK_DATA_URI} width={52} height={52} alt="Metri" />
    <span
      style={{
        fontSize: "28px",
        fontWeight: 700,
        letterSpacing: "1px",
        color: OG_COLOR.text,
      }}
    >
      Metri
    </span>
    {section ? (
      <span
        style={{ fontSize: "22px", color: OG_COLOR.faint, marginLeft: "12px" }}
      >
        · {section}
      </span>
    ) : null}
  </div>
);

/** The card's ground: near-black with the brand glow in the top right. */
export const OgFrame = ({
  padding = "60px 72px",
  children,
}: {
  padding?: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding,
      background: OG_COLOR.bg,
      backgroundImage:
        "radial-gradient(1100px 460px at 82% -12%, rgba(190,248,43,0.16), transparent)",
      fontFamily: "Geist",
      color: OG_COLOR.text,
    }}
  >
    {children}
  </div>
);

/** The bottom line of every card: where it lives, and what Metri is. */
export const OgFooter = ({ url, note }: { url: string; note: string }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: "22px",
      color: OG_COLOR.faint,
    }}
  >
    <span>{url}</span>
    <span>{note}</span>
  </div>
);

/** A small mono label: the eyebrow over a title, a chip. */
const mono = (size: number, color: string): React.CSSProperties => ({
  fontFamily: "Geist Mono",
  fontSize: `${size}px`,
  letterSpacing: "2px",
  textTransform: "uppercase",
  color,
});

type OgPanelItem = { value?: string; label: string };

/** Everything a page card can say: the eyebrow, title, URL and note always,
 * the rest when given. */
export type OgCard = {
  /** Lime kicker over the title ("Docs · Nutrition"). */
  eyebrow: string;
  title: string;
  description?: string;
  /** Short facts under the description ("6 min read"). */
  chips?: string[];
  /** A box on the right with what the page holds: a guide's sections, a
   * calculator's formula (`code`), the numbers behind the site. */
  panel?: { title?: string; items: OgPanelItem[]; code?: boolean };
  /** Where the page lives, shown in the footer ("metri.info/docs/tdee"). */
  url: string;
  /** Right side of the footer ("Free · open source"). */
  note: string;
};

const titleSize = (title: string, narrow: boolean) => {
  const n = title.length;
  if (n <= (narrow ? 22 : 30)) return 64;
  if (n <= (narrow ? 40 : 52)) return 54;
  return 46;
};

const Panel = ({ panel }: { panel: NonNullable<OgCard["panel"]> }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      width: "400px",
      flexShrink: 0,
      gap: "16px",
      padding: "28px 30px",
      borderRadius: "20px",
      background: "rgba(255,255,255,0.035)",
      border: `1px solid ${OG_COLOR.border}`,
    }}
  >
    {panel.title ? (
      <span style={mono(17, OG_COLOR.faint)}>{panel.title}</span>
    ) : null}
    {panel.items.map((item, i) =>
      panel.code ? (
        <span
          key={i}
          style={{
            fontFamily: "Geist Mono",
            fontSize: "21px",
            lineHeight: 1.35,
            color: OG_COLOR.soft,
          }}
        >
          {item.label}
        </span>
      ) : (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          {item.value ? (
            <span
              style={{
                fontFamily: "Geist Mono",
                fontSize: "28px",
                // The label's line height, so both sit on its first line.
                lineHeight: "30px",
                color: OG_COLOR.brand,
                minWidth: "44px",
              }}
            >
              {item.value}
            </span>
          ) : (
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                background: OG_COLOR.brand,
                flexShrink: 0,
                // On the first line's middle (23 px type, 1.3 leading).
                marginTop: "11px",
              }}
            />
          )}
          <span
            style={{ fontSize: "23px", lineHeight: 1.3, color: OG_COLOR.soft }}
          >
            {item.label}
          </span>
        </div>
      ),
    )}
  </div>
);

/** The card drawn: brand top left, the page's eyebrow, title and
 * description, its chips, an optional panel on the right, and the URL with a
 * note along the bottom. */
const drawCard = (card: OgCard) => {
  const { panel } = card;
  const narrow = Boolean(panel);
  return new ImageResponse(
    <OgFrame>
      <OgBrand />
      <div style={{ display: "flex", alignItems: "center", gap: "56px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <span style={mono(20, OG_COLOR.brand)}>
            {clip(card.eyebrow, narrow ? 44 : 70)}
          </span>
          <span
            style={{
              fontSize: `${titleSize(card.title, narrow)}px`,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: "-1px",
              color: OG_COLOR.text,
            }}
          >
            {clip(card.title, narrow ? 64 : 80)}
          </span>
          {card.description ? (
            <span
              style={{
                fontSize: "26px",
                lineHeight: 1.4,
                color: OG_COLOR.muted,
              }}
            >
              {clip(card.description, narrow ? 130 : 170)}
            </span>
          ) : null}
          {card.chips?.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {card.chips.map((chip) => (
                <span
                  key={chip}
                  style={{
                    ...mono(17, OG_COLOR.soft),
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: `1px solid ${OG_COLOR.border}`,
                    background: OG_COLOR.surface,
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {panel ? <Panel panel={panel} /> : null}
      </div>
      <OgFooter url={card.url} note={card.note} />
    </OgFrame>,
    { ...ogSize, fonts: ogFonts() },
  );
};

/** A card's PNG, drawn once and kept until the next deploy (its words ship
 * with the code). Without the cache an image route reads the renderer's
 * WASM on every request and Cache Components can't prerender it. */
const cardPng = async (card: OgCard) => {
  "use cache";
  cacheLife("max");
  return new Uint8Array(await drawCard(card).arrayBuffer());
};

/** What `ImageResponse` sends by default, kept for the cached PNG: a card
 * never changes within a deploy. */
const CACHE_CONTROL =
  process.env.NODE_ENV === "development"
    ? "no-cache, no-store"
    : "public, immutable, no-transform, max-age=31536000";

/**
 * The Open Graph card every page shares (1200×630). Pages describe a card
 * (`lib/og/cards.ts`); this draws it and serves the cached PNG.
 */
export const renderOgCard = async (card: OgCard) =>
  new Response(await cardPng(card), {
    headers: { "content-type": ogContentType, "cache-control": CACHE_CONTROL },
  });
