import { deflateRawSync } from "node:zlib";

/**
 * A minimal `.xlsx` writer: inline strings and numbers, one worksheet per
 * sheet, no styles beyond a bold header row. An xlsx is a zip of a few XML
 * parts, and the exports here are small tables, so this stays dependency-free
 * (no `exceljs`). If formatting, formulas or merged cells are ever wanted,
 * that is the moment to add the package rather than grow this file.
 */
export type Cell = string | number | null | undefined;
export type Sheet = { name: string; header: string[]; rows: Cell[][] };

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Excel sheet names: at most 31 chars, none of `\ / ? * [ ] :`. */
const sheetName = (name: string) =>
  name.replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Sheet";

const colRef = (i: number) => {
  let n = i + 1;
  let out = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    out = String.fromCharCode(65 + r) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
};

const cellXml = (ref: string, value: Cell, style?: number) => {
  const s = style ? ` s="${style}"` : "";
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value))
    return `<c r="${ref}"${s}><v>${value}</v></c>`;
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(String(value))}</t></is></c>`;
};

const sheetXml = (sheet: Sheet) => {
  const rows = [sheet.header, ...sheet.rows];
  const body = rows
    .map((row, r) => {
      const cells = row
        .map((v, c) => cellXml(`${colRef(c)}${r + 1}`, v, r === 0 ? 1 : 0))
        .join("");
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join("");
  const widths = sheet.header
    .map((h, c) => {
      const longest = Math.max(
        h.length,
        ...sheet.rows.map((row) => String(row[c] ?? "").length),
      );
      return `<col min="${c + 1}" max="${c + 1}" width="${Math.min(60, Math.max(10, longest + 2))}" customWidth="1"/>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${widths}</cols><sheetData>${body}</sheetData></worksheet>`;
};

const workbookXml = (sheets: Sheet[]) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets
    .map(
      (s, i) =>
        `<sheet name="${esc(sheetName(s.name))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
    )
    .join("")}</sheets></workbook>`;

const workbookRels = (sheets: Sheet[]) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
    )
    .join(
      "",
    )}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

const CONTENT_TYPES = (sheets: Sheet[]) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join("")}</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

/** Style 0 is the default; style 1 is bold (the header row). */
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>`;

// ── zip ───────────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const crc32 = (buf: Buffer) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/** DOS date/time for the zip headers (local time, 2-second resolution). */
const dosTime = (d: Date) => ({
  time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
  date:
    ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
});

type Entry = { name: string; data: Buffer };

/** A stored-or-deflated zip, the subset every spreadsheet reader accepts. */
const zip = (entries: Entry[], now = new Date()): Buffer => {
  const { time, date } = dosTime(now);
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const deflated = deflateRawSync(data);
    const method = deflated.length < data.length ? 8 : 0;
    const payload = method === 8 ? deflated : data;
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(payload.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBuf, payload);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(payload.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);
    offset += local.length + nameBuf.length + payload.length;
  }
  const centralSize = centrals.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, ...centrals, end]);
};

export const XLSX_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Build a workbook. Sheet order is preserved; an empty `sheets` still
 * yields a valid file with one blank sheet. */
export const buildXlsx = (sheets: Sheet[], now = new Date()): Buffer => {
  const list = sheets.length
    ? sheets
    : [{ name: "Sheet1", header: [], rows: [] }];
  const text = (s: string) => Buffer.from(s, "utf8");
  return zip(
    [
      { name: "[Content_Types].xml", data: text(CONTENT_TYPES(list)) },
      { name: "_rels/.rels", data: text(ROOT_RELS) },
      { name: "xl/workbook.xml", data: text(workbookXml(list)) },
      { name: "xl/_rels/workbook.xml.rels", data: text(workbookRels(list)) },
      { name: "xl/styles.xml", data: text(STYLES) },
      ...list.map((s, i) => ({
        name: `xl/worksheets/sheet${i + 1}.xml`,
        data: text(sheetXml(s)),
      })),
    ],
    now,
  );
};
