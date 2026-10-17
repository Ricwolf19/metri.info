import { ImageResponse } from "next/og";

import { createT, isLocale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { MARK_DATA_URI, ogSize, renderOg } from "@/lib/og";
import {
  AREA_KEY,
  LEVEL_KEY,
  QUIZ_AREAS,
  QUIZ_MAX_LEVEL,
} from "@/lib/quiz/areas";
import { decodeScores } from "@/lib/quiz/scores";
import { sectionCopy } from "@/lib/seo/pages";

const SIZE = 360;
const PAD = 24;
const R = SIZE / 2 - PAD;
const C = SIZE / 2;

const point = (i: number, radius: number) => {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / QUIZ_AREAS.length;
  return `${C + radius * Math.cos(angle)},${C + radius * Math.sin(angle)}`;
};

/**
 * GET /og/quiz?r=2.4.0.1&locale=en — the shareable knowledge-map card: the
 * radar on the left, the level per area on the right, same tokens as the site.
 * `r` is the result in `QUIZ_AREAS` order; a malformed one is a 400. Without
 * `r` it is the page's own card (the quiz metadata points here either way, so
 * a file-based image cannot shadow the shared one).
 */
export const GET = (req: Request) => {
  const { searchParams } = new URL(req.url);
  const locale = isLocale(searchParams.get("locale"))
    ? (searchParams.get("locale") as "en" | "es")
    : "en";
  const r = searchParams.get("r");
  if (r === null) {
    const { title, description, eyebrow } = sectionCopy("quiz", locale);
    return renderOg(title, eyebrow, description);
  }
  const scores = decodeScores(r);
  if (!scores) return new Response("Bad result", { status: 400 });
  const t = createT(locale);

  const rings = [1, 2, 3, 4].map((level) =>
    QUIZ_AREAS.map((_, i) => point(i, (R * level) / QUIZ_MAX_LEVEL)).join(" "),
  );
  const values = QUIZ_AREAS.map((area, i) =>
    point(i, R * Math.max(scores[area] / QUIZ_MAX_LEVEL, 0.04)),
  ).join(" ");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 72px",
        background: "#09090b",
        backgroundImage:
          "radial-gradient(1100px 460px at 82% -12%, rgba(190,248,43,0.16), transparent)",
        color: "#fafafa",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK_DATA_URI} width={52} height={52} alt="Metri" />
        <span
          style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "1px" }}
        >
          Metri
        </span>
        <span
          style={{ fontSize: "22px", color: "#71717a", marginLeft: "12px" }}
        >
          · {t("quiz.title")}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "64px" }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {rings.map((points, i) => (
            <polygon
              key={i}
              points={points}
              fill="none"
              stroke="#2a2a2f"
              strokeWidth={1.5}
            />
          ))}
          {QUIZ_AREAS.map((_, i) => {
            const [x, y] = point(i, R).split(",").map(Number);
            return (
              <line
                key={i}
                x1={C}
                y1={C}
                x2={x}
                y2={y}
                stroke="#2a2a2f"
                strokeWidth={1.5}
              />
            );
          })}
          <polygon
            points={values}
            fill="rgba(190,248,43,0.28)"
            stroke="#bef82b"
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: "44px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            {t("quiz.resultTitle")}
          </span>
          {QUIZ_AREAS.map((area) => (
            <div
              key={area}
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "24px",
                }}
              >
                <span style={{ fontWeight: 600 }}>{t(AREA_KEY[area])}</span>
                <span style={{ color: "#a1a1aa" }}>
                  {t(LEVEL_KEY[scores[area]])} · {scores[area]}/4
                </span>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: "10px",
                      borderRadius: "999px",
                      background: i < scores[area] ? "#bef82b" : "#202024",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "22px",
          color: "#71717a",
        }}
      >
        <span>metri.info{routePath("quiz", locale)}</span>
        <span>{t("quiz.eyebrow")}</span>
      </div>
    </div>,
    {
      ...ogSize,
      headers: {
        "cache-control": "public, max-age=600, s-maxage=86400",
        "x-robots-tag": "noindex",
      },
    },
  );
};
