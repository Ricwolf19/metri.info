import { ImageResponse } from "next/og";

import { FIGURES } from "@/lib/body/figure";
import {
  balanceFill,
  headFills,
  HIDDEN_REGIONS,
  OUTLINE,
  regionFills,
  UNTRAINED_FILL,
} from "@/lib/body/map";
import { decodeBodyShare } from "@/lib/body/share";
import { siteLabelKey } from "@/lib/body/sites";
import { signed } from "@/lib/body/units";
import { createT, isLocale } from "@/lib/i18n/config";
import { MARK_DATA_URI, ogSize } from "@/lib/og";
import { MUSCLE_HEADS } from "@/lib/training/muscles";

/**
 * GET /og/body?c=<token>&locale=en — the shareable body card: the front
 * figure painted by muscle balance, the week average and its change, the
 * key site and the session count for the window. The token carries numbers
 * only (`lib/body/share.ts`), so there is nothing to protect; a malformed
 * one is a 400.
 */
export const GET = (req: Request) => {
  const { searchParams } = new URL(req.url);
  const locale = isLocale(searchParams.get("locale"))
    ? (searchParams.get("locale") as "en" | "es")
    : "en";
  const share = decodeBodyShare(searchParams.get("c"));
  if (!share) return new Response("Bad token", { status: 400 });
  const t = createT(locale);

  const figure = FIGURES[share.sex === "f" ? "female_front" : "male_front"];
  const fillByRegion = regionFills(
    headFills("balance", {
      balance: MUSCLE_HEADS.map((head, i) => ({
        head,
        sets: 0,
        status: share.balance[i] ?? "untrained",
      })),
      fatigue: [],
      strength: [],
    }),
  );
  const regions = figure.regions.filter(
    (r) => !HIDDEN_REGIONS.includes(r.slug),
  );

  const stats: { label: string; value: string }[] = [
    {
      label: t("body.weekAverage"),
      value:
        share.weekAvgKg === null ? "—" : `${share.weekAvgKg.toFixed(1)} kg`,
    },
    {
      label: t("body.vsLastWeek"),
      value:
        share.deltaKg === null
          ? "—"
          : `${signed(Math.round(share.deltaKg * 10) / 10)} kg`,
    },
    {
      label: t(siteLabelKey(share.keySite)),
      value:
        share.keySiteDeltaCm === null
          ? "—"
          : `${signed(Math.round(share.keySiteDeltaCm * 10) / 10)} cm`,
    },
    {
      label: `${t("body.sessions")} · ${t("body.cardWindow", { n: share.windowDays })}`,
      value: String(share.sessions),
    },
  ];
  if (share.bodyFatPct !== null)
    stats.splice(2, 0, {
      label: t("body.bodyFat"),
      value: `${share.bodyFatPct.toFixed(1)} %`,
    });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "52px 72px",
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
          · {t("body.title")}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "72px" }}>
        <svg
          width={210}
          height={420}
          viewBox={figure.viewBox}
          stroke={OUTLINE}
          strokeWidth={3}
        >
          {regions.map((r) => (
            <g key={r.slug} fill={fillByRegion[r.slug] ?? UNTRAINED_FILL}>
              {r.d.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          ))}
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            flex: 1,
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                borderBottom: "1px solid #27272a",
                paddingBottom: "12px",
              }}
            >
              <span style={{ fontSize: "24px", color: "#a1a1aa" }}>
                {s.label}
              </span>
              <span
                style={{
                  fontSize: "40px",
                  fontWeight: 700,
                  color: "#fafafa",
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              gap: "18px",
              fontSize: "18px",
              color: "#a1a1aa",
            }}
          >
            {(["untrained", "low", "optimal", "high"] as const).map((s) => (
              <span
                key={s}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "999px",
                    background: balanceFill(s),
                  }}
                />
                {t(`body.legend.${s}`)}
              </span>
            ))}
          </div>
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
        <span>metri.info</span>
        <span>{t("body.eyebrow")}</span>
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
