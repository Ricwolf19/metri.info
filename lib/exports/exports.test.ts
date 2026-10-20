import { inflateRawSync } from "node:zlib";

import { describe, expect, it } from "vitest";

import { buildCsv } from "./csv";
import { buildXlsx } from "./xlsx";

/** Walk the central directory and inflate every entry, like a reader would. */
const unzip = (buf: Buffer): Record<string, string> => {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  expect(eocd).toBeGreaterThan(0);
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out: Record<string, string> = {};
  for (let i = 0; i < count; i++) {
    expect(buf.readUInt32LE(p)).toBe(0x02014b50);
    const method = buf.readUInt16LE(p + 10);
    const compressed = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const offset = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString("utf8");
    expect(buf.readUInt32LE(offset)).toBe(0x04034b50);
    const localNameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const start = offset + 30 + localNameLen + extraLen;
    const payload = buf.subarray(start, start + compressed);
    out[name] = (method === 8 ? inflateRawSync(payload) : payload).toString(
      "utf8",
    );
    p += 46 + nameLen;
  }
  return out;
};

describe("buildXlsx", () => {
  it("writes a zip whose parts a spreadsheet reader expects", () => {
    const buf = buildXlsx(
      [
        {
          name: "Weight",
          header: ["date", "weight_kg"],
          rows: [
            ["2026-10-01", 80.4],
            ["2026-10-02", null],
          ],
        },
        {
          name: "Tape / sites?",
          header: ["site", "cm"],
          rows: [["waist", 84]],
        },
      ],
      new Date(2026, 9, 20, 12, 0, 0),
    );
    const parts = unzip(buf);
    expect(Object.keys(parts).sort()).toEqual([
      "[Content_Types].xml",
      "_rels/.rels",
      "xl/_rels/workbook.xml.rels",
      "xl/styles.xml",
      "xl/workbook.xml",
      "xl/worksheets/sheet1.xml",
      "xl/worksheets/sheet2.xml",
    ]);
    expect(parts["xl/worksheets/sheet1.xml"]).toContain(
      '<c r="B2"><v>80.4</v></c>',
    );
    expect(parts["xl/worksheets/sheet1.xml"]).not.toContain('r="B3"');
    expect(parts["xl/workbook.xml"]).toContain('name="Tape   sites "');
    expect(parts["xl/worksheets/sheet1.xml"]).toContain('t="inlineStr"');
  });

  it("escapes XML in cell text", () => {
    const parts = unzip(
      buildXlsx([{ name: "S", header: ["a"], rows: [['<b> & "c"']] }]),
    );
    expect(parts["xl/worksheets/sheet1.xml"]).toContain(
      "&lt;b&gt; &amp; &quot;c&quot;",
    );
  });
});

describe("buildCsv", () => {
  it("quotes only what needs quoting and starts with a BOM", () => {
    const csv = buildCsv(
      ["a", "b"],
      [
        ["x,y", 1],
        ['say "hi"', null],
      ],
    );
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"x,y",1\r\n');
    expect(csv).toContain('"say ""hi""",\r\n');
  });
});
