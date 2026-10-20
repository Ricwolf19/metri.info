/**
 * Weigh-ins judged the only way they mean anything: as a weekly average.
 * Mirrored from the app (`src/features/body/weekly.ts`). Dates are the app's
 * `YYYY-MM-DD` local-day keys; here they are treated as UTC days, which keeps
 * the arithmetic exact without a timezone.
 */

export type WeighIn = { date: string; weightKg: number };

/** Fewer readings than this and a week's average is too thin to act on. */
export const MIN_WEIGH_INS = 3;

const MS_PER_DAY = 86_400_000;

export const dateKey = (d: Date): string => d.toISOString().slice(0, 10);

const fromKey = (key: string): Date => new Date(`${key}T00:00:00Z`);

/** Whole days from `a` to `b` (both 'YYYY-MM-DD'). */
export const daysBetween = (a: string, b: string): number =>
  Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / MS_PER_DAY);

export const addDays = (key: string, days: number): string =>
  dateKey(new Date(fromKey(key).getTime() + days * MS_PER_DAY));

export type WeekAverage = {
  index: number;
  weekStart: string;
  /** Null when the week holds no weigh-in at all. */
  avgKg: number | null;
  n: number;
  confidence: "ok" | "low" | "none";
};

/** Weeks `0..weeks-1` from `anchor`, each averaged; empty weeks are kept so a
 * chart can show them as gaps rather than collapsing the timeline. */
export const weeklyAverages = (
  entries: readonly WeighIn[],
  anchor: string,
  weeks: number,
): WeekAverage[] => {
  const buckets = Array.from(
    { length: Math.max(0, weeks) },
    () => [] as number[],
  );
  for (const e of entries) {
    const i = Math.floor(daysBetween(anchor, e.date) / 7);
    if (i >= 0 && i < buckets.length) buckets[i].push(e.weightKg);
  }
  return buckets.map((values, index) => {
    const n = values.length;
    return {
      index,
      weekStart: addDays(anchor, index * 7),
      avgKg: n
        ? Math.round((values.reduce((a, b) => a + b, 0) / n) * 100) / 100
        : null,
      n,
      confidence: n === 0 ? "none" : n < MIN_WEIGH_INS ? "low" : "ok",
    };
  });
};
