import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/** Metri dumbbell mark (lime glyph) as a data URI — Satori rasterizes `<img>`
 * data URIs reliably, unlike inline SVG with nested transforms. */
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="#bef82b"><g transform="translate(512 512) scale(4.2) translate(-512 -423)"><path d="M508.807 356.242c9.551-.178 22.716-1.285 23.606 12.61.504 7.861.157 16.342.23 24.277q.283 25.577.301 51.156.015 17.17-.222 34.337c-.146 15.519 3.533 29.756-16.398 30.562-12.602.171-23.216 1.473-23.828-14.818-.343-9.154-.325-18.281-.361-27.442l-.024-49.852.153-33.037c.103-14.814-2.786-27.249 16.543-27.793"/><path d="M553.526 377.152c13.331-.408 25.535-1.966 25.437 15.588-.161 28.516.308 57.081-.154 85.587-.126 7.812-4.002 11.092-11.387 12.766-28.534 3.032-26.249-5.46-26.325-29.004l-.031-29.167.062-27.922c.049-12.308-2.966-25.451 12.398-27.848"/><path d="M457.78 377.196c7.531-.264 18.699-1.008 23.806 5.58.891 1.15 1.688 6.653 1.697 8.415.144 29.097.3 58.236-.064 87.329-.092 7.34-3.568 10.834-10.593 12.502-4.044.229-7.952.527-12.004.391-16.806-.562-14.697-11.277-14.689-23.425l.038-27.08-.037-33.995c-.004-3.799.047-7.821-.004-11.602-.133-9.982.344-16.472 11.85-18.115"/><path d="m433.367 401.227 6.363.171-.208 65.049c-3.475.081-7.075.007-10.56-.021-2.299-.626-6.319-3.016-6.453-5.504-.904-16.769-.482-34.121-.361-50.915.057-7.841 4.684-8.3 11.219-8.78"/><path d="M585.526 401.42c7.984-.203 11.976-1.644 16.964 5.452.131 2.993.157 6.107.099 9.134-.284 14.83.646 29.881-.421 44.648-.082 1.141-1.453 2.795-2.188 3.698-4.371 2.821-9.614 2.084-14.734 1.912z"/><path d="M410.397 425.075c2.651-.172 5.923-.128 8.635-.156l.056 16.694c-1.897-.014-4.193.251-6.111.417-3.73-.536-6.282-1.568-7.92-5.262a8.47 8.47 0 0 1-.123-6.517c1.158-2.902 2.782-3.923 5.463-5.176"/><path d="M605.893 425.019c4.123-.166 7.07-.683 10.77 1.629 5.036 3.147 4.176 8.615 1.224 13.032-3.574 2.987-7.423 2.259-11.97 2.054a597 597 0 0 1-.024-16.715"/></g></svg>`;
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
