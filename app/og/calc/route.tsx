import { ImageResponse } from "next/og";

import { CALC_CONTENT } from "@/lib/calculators/content";
import { CALCULATORS } from "@/lib/calculators/registry";
import { decodeValues, readValues } from "@/lib/calculators/share";
import type { CalcId, CalcResult } from "@/lib/calculators/types";
import { createT, isLocale } from "@/lib/i18n/config";
import {
  OG_COLOR,
  OgBrand,
  ogFonts,
  OgFooter,
  OgFrame,
  ogSize,
  ogUrl,
} from "@/lib/og/render";

const toNumber = (formatted: string) =>
  Number(formatted.replace(/[^0-9.-]/g, ""));

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      padding: "18px 22px",
      borderRadius: "16px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    <span style={{ fontSize: "20px", color: OG_COLOR.muted }}>{label}</span>
    <span style={{ fontSize: "34px", fontWeight: 700, color: OG_COLOR.text }}>
      {value}
    </span>
  </div>
);

const primaryText = (res: CalcResult, unit = "") =>
  res
    ? `${res.primaryValue}${res.primaryUnit ? ` ${res.primaryUnit}` : unit}`
    : "—";

export const GET = (req: Request) => {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get("id");
  if (!rawId || !(rawId in CALCULATORS)) {
    return new Response("Unknown calculator", { status: 400 });
  }
  const id = rawId as CalcId;
  const config = CALCULATORS[id];
  const locale = isLocale(searchParams.get("locale"))
    ? (searchParams.get("locale") as "en" | "es")
    : "en";
  const t = createT(locale);
  const content = CALC_CONTENT[id][locale];

  const a = readValues(config, (k) => searchParams.get(k));
  const resA = config.compute(a);
  const packedB = searchParams.get("b");
  const compare = searchParams.get("compare") === "1" && packedB !== null;
  const resB =
    compare && packedB ? config.compute(decodeValues(config, packedB)) : null;

  const headers = {
    "cache-control": "public, max-age=600, s-maxage=86400",
    "x-robots-tag": "noindex",
  };

  if (compare && resA && resB) {
    const delta = toNumber(resB.primaryValue) - toNumber(resA.primaryValue);
    const sign = delta > 0 ? "+" : "";
    const unit = resA.primaryUnit ? ` ${resA.primaryUnit}` : "";
    const column = (tag: string, res: CalcResult) => (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "28px 30px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          style={{ fontSize: "22px", color: OG_COLOR.brand, fontWeight: 700 }}
        >
          {tag}
        </span>
        <span
          style={{ fontSize: "56px", fontWeight: 700, color: OG_COLOR.text }}
        >
          {primaryText(res)}
        </span>
        <span style={{ fontSize: "20px", color: OG_COLOR.muted }}>
          {res ? t(res.primaryLabelKey) : ""}
        </span>
      </div>
    );
    return new ImageResponse(
      <OgFrame>
        <OgBrand />
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span
            style={{ fontSize: "40px", fontWeight: 700, color: OG_COLOR.text }}
          >
            {content.h1}
          </span>
          <div style={{ display: "flex", gap: "20px" }}>
            {column("A", resA)}
            {column("B", resB)}
          </div>
          <span style={{ fontSize: "26px", color: OG_COLOR.brand }}>
            {t("calc.difference")}: {sign}
            {Math.abs(delta).toLocaleString("en-US")}
            {unit}
          </span>
        </div>
        <OgFooter url={ogUrl("/")} note={t("og.note")} />
      </OgFrame>,
      { ...ogSize, headers, fonts: ogFonts() },
    );
  }

  const rows = (resA?.rows ?? []).slice(0, 3);
  return new ImageResponse(
    <OgFrame>
      <OgBrand />
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <span
          style={{
            fontFamily: "Geist Mono",
            fontSize: "20px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: OG_COLOR.brand,
          }}
        >
          {content.h1}
        </span>
        <span
          style={{ fontSize: "92px", fontWeight: 700, color: OG_COLOR.text }}
        >
          {primaryText(resA)}
        </span>
        <span style={{ fontSize: "28px", color: OG_COLOR.muted }}>
          {resA ? t(resA.primaryLabelKey) : ""}
        </span>
        {rows.length > 0 && (
          <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
            {rows.map((row, i) => (
              <Stat
                key={i}
                label={row.labelKey ? t(row.labelKey) : (row.label ?? "")}
                value={row.value}
              />
            ))}
          </div>
        )}
      </div>
      <OgFooter url={ogUrl("/")} note={t("og.note")} />
    </OgFrame>,
    { ...ogSize, headers, fonts: ogFonts() },
  );
};
