import type { CalcConfig, CalcValues } from "./types";

/**
 * URL (de)serialization for calculator state — shared by the client widget and
 * the server OG-image route so a link always reproduces the exact result.
 * Set "A" rides as flat field params (`weight=80&reps=5`); set "B" (compare
 * mode) is packed into a single `b=weight:90;reps:5` param.
 */

/** Read a value set, falling back to each field's default for missing/invalid. */
export const readValues = (
  config: CalcConfig,
  get: (key: string) => string | null,
): CalcValues => {
  const values: CalcValues = {};
  for (const f of config.fields) {
    const raw = get(f.name);
    if (f.kind === "number") {
      values[f.name] = raw !== null && raw !== "" ? Number(raw) : f.default;
    } else {
      values[f.name] =
        raw !== null && f.options.some((o) => o.value === raw)
          ? raw
          : f.default;
    }
  }
  return values;
};

/** Pack a value set into the compact `b` param string. */
const encodeValues = (config: CalcConfig, values: CalcValues): string =>
  config.fields.map((f) => `${f.name}:${values[f.name]}`).join(";");

/** Parse the compact `b` param string back into a value set. */
export const decodeValues = (
  config: CalcConfig,
  packed: string,
): CalcValues => {
  const map = new Map<string, string>();
  for (const part of packed.split(";")) {
    const i = part.indexOf(":");
    if (i > 0) map.set(part.slice(0, i), part.slice(i + 1));
  }
  return readValues(config, (k) => map.get(k) ?? null);
};

/** Build the query string for a calculator URL (A always; B only when comparing). */
export const buildSearch = (
  config: CalcConfig,
  a: CalcValues,
  b: CalcValues,
  compare: boolean,
): string => {
  const params = new URLSearchParams();
  for (const f of config.fields) params.set(f.name, String(a[f.name]));
  if (compare) {
    params.set("compare", "1");
    params.set("b", encodeValues(config, b));
  }
  return params.toString();
};
