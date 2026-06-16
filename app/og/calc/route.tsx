import { ImageResponse } from "next/og";

import { CALC_CONTENT } from "@/lib/calculators/content";
import { CALCULATORS } from "@/lib/calculators/registry";
import { decodeValues, readValues } from "@/lib/calculators/share";
import type { CalcId, CalcResult } from "@/lib/calculators/types";
import { createT, isLocale } from "@/lib/i18n/config";
import { MARK_DATA_URI, ogSize } from "@/lib/og";

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
    <span style={{ fontSize: "20px", color: "#a1a1aa" }}>{label}</span>
    <span style={{ fontSize: "34px", fontWeight: 700, color: "#fafafa" }}>
      {value}
    </span>
  </div>
);

const Brand = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={MARK_DATA_URI} width={52} height={52} alt="METRI" />
    <span
      style={{
        fontSize: "28px",
        fontWeight: 700,
        letterSpacing: "1px",
        color: "#fafafa",
      }}
    >
      METRI
    </span>
  </div>
);

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "64px 72px",
      background: "#09090b",
      backgroundImage:
        "radial-gradient(1100px 460px at 82% -12%, rgba(190,248,43,0.16), transparent)",
    }}
  >
    {children}
  </div>
);

const Footer = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: "22px",
      color: "#71717a",
    }}
  >
    <span>metri.info</span>
    <span>Free · open source</span>
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
    // Keep the raw image endpoint out of search indexes, but still fetchable by
    // social crawlers (unlike a robots.txt block, which would hide the preview).
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
        <span style={{ fontSize: "22px", color: "#bef82b", fontWeight: 700 }}>
          {tag}
        </span>
        <span style={{ fontSize: "56px", fontWeight: 700, color: "#fafafa" }}>
          {primaryText(res)}
        </span>
        <span style={{ fontSize: "20px", color: "#a1a1aa" }}>
          {res ? t(res.primaryLabelKey) : ""}
        </span>
      </div>
    );
    return new ImageResponse(
      <Frame>
        <Brand />
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontSize: "40px", fontWeight: 700, color: "#fafafa" }}>
            {content.h1}
          </span>
          <div style={{ display: "flex", gap: "20px" }}>
            {column("A", resA)}
            {column("B", resB)}
          </div>
          <span style={{ fontSize: "26px", color: "#bef82b" }}>
            {t("calc.difference")}: {sign}
            {Math.abs(delta).toLocaleString("en-US")}
            {unit}
          </span>
        </div>
        <Footer />
      </Frame>,
      { ...ogSize, headers },
    );
  }

  const rows = (resA?.rows ?? []).slice(0, 3);
  return new ImageResponse(
    <Frame>
      <Brand />
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <span
          style={{
            fontSize: "20px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#bef82b",
          }}
        >
          {content.h1}
        </span>
        <span style={{ fontSize: "92px", fontWeight: 700, color: "#fafafa" }}>
          {primaryText(resA)}
        </span>
        <span style={{ fontSize: "28px", color: "#a1a1aa" }}>
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
      <Footer />
    </Frame>,
    { ...ogSize, headers },
  );
};
