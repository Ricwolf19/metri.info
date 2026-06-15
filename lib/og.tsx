import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/** Branded 1200×630 Open Graph card with title + description. System fonts. */
export const renderOg = (title: string, eyebrow = "METRI", description = "") =>
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
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            width: "48px",
            height: "48px",
            borderRadius: "13px",
            background: "#bef82b",
          }}
        />
        <div
          style={{
            fontSize: "30px",
            fontWeight: 700,
            letterSpacing: "1px",
            color: "#fafafa",
          }}
        >
          METRI
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
