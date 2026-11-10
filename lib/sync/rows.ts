/**
 * Reading `sync_row.data`: opaque JSON owned by the phone, so every field is
 * guarded and anything malformed reads as null and gets dropped rather than
 * rendered. Column names follow the app's SQLite schema (snake_case, epoch-ms
 * timestamps, `YYYY-MM-DD` local dates).
 */

export type Row = Record<string, unknown>;

export const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
export const str = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;
export const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
export const asRow = (v: unknown): Row | null =>
  typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Row) : null;
export const strList = (v: unknown): string[] | null =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : null;

export type FoodDay = { date: string; kcal: number; proteinG: number };

/** `food_logs` rows summed per day, unrounded, oldest first. */
export const foodTotalsByDay = (
  rows: readonly Row[],
  sinceKey = "",
): FoodDay[] => {
  const byDay = new Map<string, FoodDay>();
  for (const f of rows) {
    if (!isDate(f.date) || f.date < sinceKey) continue;
    const day = byDay.get(f.date) ?? { date: f.date, kcal: 0, proteinG: 0 };
    day.kcal += num(f.kcal) ?? 0;
    day.proteinG += num(f.protein_g) ?? 0;
    byDay.set(f.date, day);
  }
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
};
