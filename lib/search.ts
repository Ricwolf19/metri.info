/**
 * Accent- and case-insensitive search helpers. Normalizing with NFD + stripping
 * combining marks means "imc" matches "IMC", "proteina" matches "proteína", and
 * "deficit" matches "déficit" — so people find things whether or not they type
 * the accents.
 */
const normalizeText = (value: string): string =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** True when the (accent-insensitive) query appears in any of the fields. An
 * empty query matches everything. */
export const textMatches = (
  query: string,
  ...fields: (string | undefined | null)[]
): boolean => {
  const q = normalizeText(query.trim());
  if (!q) return true;
  const haystack = normalizeText(fields.filter(Boolean).join(" "));
  return haystack.includes(q);
};
