import { ImageResponse } from "next/og";

import { markSvg } from "@/lib/brand/mark";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/** Metri dumbbell mark (lime glyph) as a data URI — Satori rasterizes `<img>`
 * data URIs reliably, unlike inline SVG with nested transforms. */
const MARK_SVG = markSvg("#bef82b");
export const MARK_DATA_URI = `data:image/svg+xml,${encodeURIComponent(MARK_SVG)}`;

/** Branded 1200×630 Open Graph card with title + description. System fonts. */
export const renderOg = (title: string, eyebrow = "Metri", description = "") =>
  new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#09090b",
        backgroundImage:
          "radial-gradient(1100px 460px at 82% -12%, rgba(190,248,43,0.16), transparent)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK_DATA_URI} width={56} height={56} alt="Metri" />
        <div
          style={{
            fontSize: "30px",
            fontWeight: 700,
            letterSpacing: "1px",
            color: "#fafafa",
          }}
        >
          Metri
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div
          style={{
            fontSize: "21px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#bef82b",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "64px",
            fontWeight: 700,
            lineHeight: 1.05,
            color: "#fafafa",
            maxWidth: "960px",
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              lineHeight: 1.35,
              color: "#a1a1aa",
              maxWidth: "880px",
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "24px",
          color: "#71717a",
        }}
      >
        <span>metri.info</span>
        <span>Free · open source</span>
      </div>
    </div>,
    { ...ogSize },
  );
