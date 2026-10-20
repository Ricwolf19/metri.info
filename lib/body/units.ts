import { KG_PER_LB } from "@/lib/calculations/units";

/**
 * Display helpers shared by the body page, its tape list and the share card:
 * stored metric values in the account's unit, one decimal, and a signed
 * change. Kept here so the three surfaces never round differently.
 */
export const CM_PER_IN = 2.54;

const tenth = (n: number) => Math.round(n * 10) / 10;

/** Kilograms as kg or lb, one decimal. */
export const displayWeight = (kg: number, imperial: boolean): number =>
  tenth(imperial ? kg / KG_PER_LB : kg);

/** Centimetres as cm or in, one decimal. */
export const displayLength = (cm: number, imperial: boolean): number =>
  tenth(imperial ? cm / CM_PER_IN : cm);

/** `+1.2` / `-0.4` / `0`: a change reads as a direction. */
export const signed = (n: number): string => (n > 0 ? `+${n}` : String(n));
