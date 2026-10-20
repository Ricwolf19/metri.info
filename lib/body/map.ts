import type {
  BalanceStatus,
  MuscleBalance,
  MuscleFatigue,
  MuscleStrength,
} from "@/lib/training/muscle-load";
import { MUSCLE_HEADS, type MuscleHead } from "@/lib/training/muscles";

/**
 * How the body map is painted, mirrored from the app's `muscle-colors.ts`
 * and `BodyMap.tsx`. Literal colours on purpose: these fills go into SVG
 * attributes and the share card (Satori), neither of which reads CSS tokens;
 * the values are the same ones the tokens resolve to.
 *
 * Hue alone is not the signal. Red/amber/green is unreadable for the ~8% of
 * men with a red-green deficiency, so each state also differs in fill
 * density, and every view pairs the figure with a labelled legend.
 */
export type MapView = "balance" | "fatigue" | "strength";

export const MAP_VIEWS: readonly MapView[] = ["balance", "fatigue", "strength"];

/** The figure's outline, the grey the app draws it with. */
export const OUTLINE = "#52525b";
/** Selected region stroke and the "on target" fill: the brand token's value. */
export const BRAND = "#bef82b";
const OVER = "#ef4444";
const UNDER = "#f59e0b";

/** Faintest tint that still separates from the bare fill on a black page. */
const MIN_TINT = 0.4;

/** Muscle with no recorded work in the window: bare, not coloured. */
export const UNTRAINED_FILL = "#3f3f46";

const withAlpha = (hex: string, alpha: number): string =>
  `${hex}${Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0")}`;

export const balanceFill = (status: BalanceStatus): string => {
  if (status === "untrained") return UNTRAINED_FILL;
  if (status === "low") return UNDER;
  if (status === "high") return OVER;
  return BRAND;
};

/** One hue, ramped by opacity: fatigue is a continuum. `index` is 0–1. */
export const fatigueFill = (index: number): string => {
  if (index <= 0) return UNTRAINED_FILL;
  return withAlpha(OVER, MIN_TINT + index * (1 - MIN_TINT));
};

/** Days after which a muscle reads as detrained rather than merely resting. */
export const DETRAINED_DAYS = 14;

export const recencyFill = (daysSince: number | null): string => {
  if (daysSince == null) return UNTRAINED_FILL;
  if (daysSince >= DETRAINED_DAYS) return UNDER;
  const freshness = 1 - daysSince / DETRAINED_DAYS;
  return withAlpha(BRAND, Math.max(MIN_TINT, freshness));
};

export type HeadFill = { color: string; weight: number };

export type MuscleLoads = {
  balance: MuscleBalance[];
  fatigue: MuscleFatigue[];
  strength: MuscleStrength[];
};

/** One fill per head for a view, plus the weight used to resolve heads that
 * share a drawn region (the strongest signal wins, never an average). */
export const headFills = (
  view: MapView,
  loads: MuscleLoads,
): Record<MuscleHead, HeadFill> => {
  const out = {} as Record<MuscleHead, HeadFill>;
  if (view === "balance") {
    const rank: Record<BalanceStatus, number> = {
      untrained: 0,
      optimal: 1,
      low: 2,
      high: 3,
    };
    for (const b of loads.balance)
      out[b.head] = { color: balanceFill(b.status), weight: rank[b.status] };
  } else if (view === "fatigue") {
    for (const f of loads.fatigue)
      out[f.head] = { color: fatigueFill(f.index), weight: f.index };
  } else {
    for (const s of loads.strength)
      out[s.head] = {
        color: recencyFill(s.daysSince),
        weight: s.daysSince == null ? 0 : DETRAINED_DAYS - s.daysSince,
      };
  }
  for (const head of MUSCLE_HEADS)
    out[head] ??= { color: UNTRAINED_FILL, weight: 0 };
  return out;
};

/**
 * Canonical head → the region the figure can draw. The figure has one
 * `deltoids`, one `chest` and no lats/mid-back split, so several heads
 * collapse onto the same region; only the drawing aggregates.
 */
export const HEAD_TO_REGION: Record<MuscleHead, string> = {
  chest: "chest",
  upper_chest: "chest",
  lats: "upper-back",
  mid_back: "upper-back",
  lower_back: "lower-back",
  traps: "trapezius",
  front_delts: "deltoids",
  side_delts: "deltoids",
  rear_delts: "deltoids",
  biceps: "biceps",
  triceps: "triceps",
  forearms: "forearm",
  abs: "abs",
  obliques: "obliques",
  quads: "quadriceps",
  hamstrings: "hamstring",
  glutes: "gluteal",
  adductors: "adductors",
  calves: "calves",
};

/** Regions the figure draws that no exercise can train. */
export const HIDDEN_REGIONS: readonly string[] = [
  "hair",
  "head",
  "hands",
  "feet",
  "ankles",
  "neck",
  "knees",
  "tibialis",
];

/** Every head a drawn region stands for, for the drilldown list. */
export const headsForRegion = (region: string): MuscleHead[] =>
  MUSCLE_HEADS.filter((head) => HEAD_TO_REGION[head] === region);

/** Region slug → colour, the strongest head winning a shared region. */
export const regionFills = (
  fills: Record<MuscleHead, HeadFill>,
): Record<string, string> => {
  const strongest = new Map<string, HeadFill>();
  for (const head of MUSCLE_HEADS) {
    const fill = fills[head];
    const region = HEAD_TO_REGION[head];
    const current = strongest.get(region);
    if (!current || fill.weight > current.weight) strongest.set(region, fill);
  }
  return Object.fromEntries(
    [...strongest.entries()].map(([slug, fill]) => [slug, fill.color]),
  );
};
