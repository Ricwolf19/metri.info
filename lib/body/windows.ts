import type { MuscleLoads } from "@/lib/body/map";
import type { MuscleHead } from "@/lib/training/muscles";

/**
 * The body page's windows and the per-window load shape, kept out of the
 * server-only reader so the client map can import them.
 */
export type BodyWindow = 7 | 30 | 90;
export const BODY_WINDOWS: readonly BodyWindow[] = [7, 30, 90];

export const parseWindow = (value: unknown): BodyWindow => {
  const n = Number(value);
  return (BODY_WINDOWS as readonly number[]).includes(n)
    ? (n as BodyWindow)
    : 30;
};

export type HeadExercise = { id: string; sets: number };

export type WindowLoads = {
  loads: MuscleLoads;
  /** Working sets logged in the window. */
  sets: number;
  /** Completed sessions in the window. */
  sessions: number;
  /** Per head, the exercises that trained it most (fractional sets). */
  topByHead: Record<MuscleHead, HeadExercise[]>;
};
