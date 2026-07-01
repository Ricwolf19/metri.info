"use client";

import { CheckIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";

type Tier = {
  nameKey: TranslationKey;
  taglineKey: TranslationKey;
  featureKeys: TranslationKey[];
  highlight?: boolean;
  badgeKey?: TranslationKey;
};

const TIERS: Tier[] = [
  {
    nameKey: "benefits.guest.name",
    taglineKey: "benefits.guest.tagline",
    featureKeys: [
      "benefits.guest.f1",
      "benefits.guest.f2",
      "benefits.guest.f3",
    ],
  },
  {
    nameKey: "benefits.free.name",
    taglineKey: "benefits.free.tagline",
    highlight: true,
    badgeKey: "benefits.free.badge",
    featureKeys: [
      "benefits.free.f1",
      "benefits.free.f2",
      "benefits.free.f3",
      "benefits.free.f4",
    ],
  },
  {
    nameKey: "benefits.soon.name",
    taglineKey: "benefits.soon.tagline",
    badgeKey: "benefits.soon.badge",
    featureKeys: ["benefits.soon.f1", "benefits.soon.f2", "benefits.soon.f3"],
  },
];

const TierCard = ({ tier, compact }: { tier: Tier; compact: boolean }) => {
  const t = useT();
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-card border bg-ink-850",
        compact ? "p-4" : "p-5",
        tier.highlight
          ? "border-accent/60 bg-ink-800 ring-1 ring-accent/30"
          : "border-ink-600",
      )}
    >
      <div
        className={cn("flex min-h-5 items-start", compact ? "mb-2" : "mb-2.5")}
      >
        {tier.badgeKey && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
              tier.highlight
                ? "bg-accent-fill text-ink-900"
                : "border border-ink-500 bg-ink-700 text-ink-300",
            )}
          >
            {t(tier.badgeKey)}
          </span>
        )}
      </div>

      <div className={cn("flex items-start", compact ? "min-h-9" : "min-h-12")}>
        <h3
          className={cn(
            "font-semibold text-ink-50",
            compact ? "text-sm" : "text-base",
          )}
        >
          {t(tier.nameKey)}
        </h3>
      </div>

      <p
        className={cn(
          "text-ink-400",
          compact ? "min-h-8 text-xs leading-snug" : "min-h-10 text-sm",
        )}
      >
        {t(tier.taglineKey)}
      </p>

      <div
        className={cn(
          "border-t border-ink-700",
          compact ? "mt-3 pt-3" : "mt-4 pt-4",
        )}
      />

      <ul className="flex flex-1 flex-col gap-2">
        {tier.featureKeys.map((key) => (
          <li key={key} className="flex items-start gap-2 text-ink-200">
            <CheckIcon
              size={16}
              className={cn(
                "mt-0.5 shrink-0",
                tier.highlight ? "text-accent" : "text-ink-400",
              )}
            />
            <span className={compact ? "text-xs leading-snug" : "text-sm"}>
              {t(key)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Neon-pricing-style benefits/value panel (NOT billing — no prices). A
 * three-column comparison of Guest vs Free account vs Coming soon, communicating
 * why an account is worth it. `compact` renders a slim variant for embedding in
 * the save-prompt modal; the full variant stands alone for marketing/SEO.
 *
 * Columns are structurally uniform regardless of content: every card is the same
 * height (`items-stretch` + `h-full`) and shares aligned zones — a reserved badge
 * row, a min-height title zone (so a 1-line and a 2-line title still align the
 * divider below them), a reserved tagline row, a divider, then the feature list
 * which `flex-1`-grows so every card bottom lines up.
 */
export const BenefitsPanel = ({ compact = false }: { compact?: boolean }) => (
  <div
    className={cn(
      "grid items-stretch gap-3",
      compact ? "sm:grid-cols-3" : "gap-4 md:grid-cols-3",
    )}
  >
    {TIERS.map((tier) => (
      <TierCard key={tier.nameKey} tier={tier} compact={compact} />
    ))}
  </div>
);
