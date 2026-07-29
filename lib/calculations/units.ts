/**
 * Unit conversions — pure, no framework deps. Unlike the other calculation
 * modules (which take metric and let callers handle display units), these are
 * the conversion itself, so both directions are first-class.
 */
import { round } from "./shared";

/** International avoirdupois pound — exact by definition (1959 agreement). */
export const KG_PER_LB = 0.45359237;

export const lbToKg = (lb: number): number =>
  lb > 0 && Number.isFinite(lb) ? round(lb * KG_PER_LB, 2) : 0;

export const kgToLb = (kg: number): number =>
  kg > 0 && Number.isFinite(kg) ? round(kg / KG_PER_LB, 2) : 0;
