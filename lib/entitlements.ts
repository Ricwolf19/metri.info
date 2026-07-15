/**
 * Feature entitlements derived from a plan — the single place that maps a plan
 * to what it unlocks. App code checks `can(plan, feature)`, never `plan ===
 * "premium"`, so adding tiers/features later needs no refactor. Mirrored on the
 * mobile app (metri/src/features/auth/entitlements.ts).
 */
export type Plan = "free" | "premium";
export type Feature = "sync";

const ENTITLEMENTS: Record<Plan, Record<Feature, boolean>> = {
  free: { sync: false },
  premium: { sync: true },
};

const normalize = (plan: string | null | undefined): Plan =>
  plan === "premium" ? "premium" : "free";

export const entitlementsFor = (plan: string | null | undefined) =>
  ENTITLEMENTS[normalize(plan)];

export const can = (
  plan: string | null | undefined,
  feature: Feature,
): boolean => entitlementsFor(plan)[feature] ?? false;
