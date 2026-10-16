"use client";

import {
  CheckIcon,
  CloudSyncIcon,
  SmartphoneIcon,
  ProfileIcon,
  type IconProps,
} from "@/components/icons";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";

type Tier = {
  id: "local" | "free" | "premium";
  icon: React.ComponentType<IconProps>;
  nameKey: TranslationKey;
  priceKey: TranslationKey;
  taglineKey: TranslationKey;
  featureKeys: TranslationKey[];
  highlight?: boolean;
  badgeKey?: TranslationKey;
};

/** Mirrors the mobile app's Plan screen (`src/app/plan.tsx`): Local, Free
 * account, Premium. Premium is sync only and is granted by hand during the
 * beta — there is no price, card or trial anywhere in the product. */
const TIERS: Tier[] = [
  {
    id: "local",
    icon: SmartphoneIcon,
    nameKey: "plans.local.name",
    priceKey: "plans.local.price",
    taglineKey: "plans.local.tagline",
    featureKeys: [
      "plans.local.f1",
      "plans.local.f2",
      "plans.local.f3",
      "plans.local.f4",
    ],
  },
  {
    id: "free",
    icon: ProfileIcon,
    nameKey: "plans.free.name",
    priceKey: "plans.free.price",
    taglineKey: "plans.free.tagline",
    highlight: true,
    badgeKey: "plans.free.badge",
    featureKeys: [
      "plans.free.f1",
      "plans.free.f2",
      "plans.free.f3",
      "plans.free.f4",
    ],
  },
  {
    id: "premium",
    icon: CloudSyncIcon,
    nameKey: "plans.premium.name",
    priceKey: "plans.premium.price",
    taglineKey: "plans.premium.tagline",
    badgeKey: "plans.premium.badge",
    featureKeys: [
      "plans.premium.f1",
      "plans.premium.f2",
      "plans.premium.f3",
      "plans.premium.f4",
    ],
  },
];

const TierCard = ({ tier, compact }: { tier: Tier; compact: boolean }) => {
  const t = useT();
  const Icon = tier.icon;
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-card border bg-ink-850",
        compact ? "p-4" : "p-6",
        tier.highlight
          ? "border-brand/50 bg-ink-800 ring-1 ring-brand/20"
          : "border-ink-600",
      )}
    >
      {tier.highlight && (
        <div
          aria-hidden
          className="glow-brand pointer-events-none absolute inset-x-0 top-0 h-24"
        />
      )}
      <div className="relative flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex items-center justify-center rounded-field",
            compact ? "h-9 w-9" : "h-11 w-11",
            tier.highlight
              ? "border border-brand/30 bg-brand/10 text-brand"
              : "bg-ink-700 text-accent",
          )}
        >
          <Icon size={compact ? 16 : 20} />
        </span>
        {tier.badgeKey && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide uppercase",
              tier.highlight
                ? "bg-brand text-brand-contrast"
                : "border border-ink-500 bg-ink-700 text-ink-300",
            )}
          >
            {t(tier.badgeKey)}
          </span>
        )}
      </div>

      <h3
        className={cn(
          "relative mt-4 font-semibold text-ink-50",
          compact ? "text-sm" : "text-lg",
        )}
      >
        {t(tier.nameKey)}
      </h3>
      <p
        className={cn(
          "relative font-mono font-bold text-ink-50",
          compact ? "text-lg" : "mt-1 text-3xl",
        )}
      >
        {t(tier.priceKey)}
      </p>
      <p
        className={cn(
          "relative text-ink-400",
          compact ? "min-h-8 text-xs leading-snug" : "mt-1.5 min-h-10 text-sm",
        )}
      >
        {t(tier.taglineKey)}
      </p>

      <div
        className={cn(
          "border-t border-ink-700",
          compact ? "mt-3 pt-3" : "mt-5 pt-5",
        )}
      />

      <ul className="relative flex flex-1 flex-col gap-2.5">
        {tier.featureKeys.map((key) => (
          <li key={key} className="flex items-start gap-2 text-ink-200">
            <CheckIcon
              size={16}
              className={cn(
                "mt-0.5 shrink-0",
                tier.highlight ? "text-brand" : "text-ink-400",
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
 * The three ways to use Metri, as the app's own Plan screen states them. Not
 * billing: every tier reads "free" because nothing in the product is paid yet.
 * `compact` fits the save-prompt modal; the full variant is the landing page's
 * plans section.
 */
export const BenefitsPanel = ({ compact = false }: { compact?: boolean }) => (
  <div
    className={cn(
      "grid items-stretch gap-3",
      compact ? "sm:grid-cols-3" : "gap-4 md:grid-cols-3",
    )}
  >
    {TIERS.map((tier) => (
      <TierCard key={tier.id} tier={tier} compact={compact} />
    ))}
  </div>
);
