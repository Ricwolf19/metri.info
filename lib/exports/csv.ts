import type { Cell } from "@/lib/exports/xlsx";

/** RFC 4180 CSV with a UTF-8 BOM, so Excel opens accents correctly. */
export const CSV_TYPE = "text/csv; charset=utf-8";

const field = (v: Cell) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const BOM = "\uFEFF";

export const buildCsv = (header: string[], rows: Cell[][]): string =>
  `${BOM}${[header, ...rows].map((r) => r.map(field).join(",")).join("\r\n")}\r\n`;
