import type { TranslationKey } from "@/lib/i18n/en";

/**
 * The tape-measurement catalogue, mirrored from the app
 * (`src/features/body/sites.ts`). `body_measurements.site` stores the id as
 * plain text, so this list is a sync wire format: add, never rename. `core`
 * is the weekly check-in, `pro` sites are opt-in per user on the phone.
 */
export const MEASUREMENT_SITES = [
  { id: "chest", set: "core" },
  { id: "waist", set: "core" },
  { id: "hips", set: "core" },
  { id: "arm_left", set: "core" },
  { id: "arm_right", set: "core" },
  { id: "leg_left", set: "core" },
  { id: "leg_right", set: "core" },
  { id: "neck", set: "pro" },
  { id: "shoulders", set: "pro" },
  { id: "arm_flexed", set: "pro" },
  { id: "forearm", set: "pro" },
  { id: "calf", set: "pro" },
] as const;

export type SiteId = (typeof MEASUREMENT_SITES)[number]["id"];

const SITE_IDS: readonly string[] = MEASUREMENT_SITES.map((s) => s.id);

export const isSiteId = (value: unknown): value is SiteId =>
  typeof value === "string" && SITE_IDS.includes(value);

export const siteLabelKey = (id: SiteId): TranslationKey => `site.${id}`;

/** The site that tells the truth about a phase: fat is gained and lost first
 * where each sex stores it. */
export const keySiteFor = (sex: string | null | undefined): SiteId =>
  sex === "female" ? "hips" : "waist";

/** Where each site sits on the figure (front view, 0–100 of the viewBox), so
 * the tape readings can be pinned onto the silhouette. Paired sites share a
 * height on opposite sides. */
export const SITE_ANCHOR: Record<SiteId, { x: number; y: number }> = {
  neck: { x: 50, y: 15 },
  shoulders: { x: 50, y: 20 },
  chest: { x: 50, y: 27 },
  waist: { x: 50, y: 38 },
  hips: { x: 50, y: 46 },
  arm_left: { x: 72, y: 29 },
  arm_right: { x: 28, y: 29 },
  arm_flexed: { x: 72, y: 26 },
  forearm: { x: 76, y: 39 },
  leg_left: { x: 60, y: 56 },
  leg_right: { x: 40, y: 56 },
  calf: { x: 42, y: 78 },
};
