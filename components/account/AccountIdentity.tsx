import { CheckIcon, LockIcon, StarIcon } from "@/components/icons";
import type { AccountStats } from "@/lib/account/stats";
import { createT, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Account identity header — avatar/initial, name, email, member-since, the
 * real plan state (Free = current; Pro = coming soon / paid mobile-sync tier)
 * and factual activity counts.
 */
export const AccountIdentity = ({
  name,
  email,
  image,
  createdAt,
  stats,
  locale,
  plan = "free",
}: {
  name: string;
  email: string;
  image?: string | null;
  createdAt?: Date | string | null;
  stats: AccountStats;
  locale: Locale;
  plan?: string | null;
}) => {
  const t = createT(locale);
  const isPremium = plan === "premium";
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();
  const since = createdAt
    ? new Date(createdAt).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="relative overflow-hidden rounded-card border border-ink-600 bg-ink-850 p-6 sm:p-7">
      <div
        aria-hidden
        className="glow-brand pointer-events-none absolute inset-x-0 top-0 h-24"
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="h-14 w-14 rounded-full border border-ink-600 object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-xl font-semibold text-brand">
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-ink-50">{name}</h1>
            <p className="truncate text-sm text-ink-400">{email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-wide text-ink-500">
              {since && (
                <span>
                  {t("account.memberSince")} {since}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <StarIcon size={12} />
                {stats.favorites} {t("account.statsFavs")}
              </span>
              <span>
                {stats.saved} {t("account.statsCalcs")}
              </span>
            </div>
          </div>
        </div>

        {/* Plan — reflects the real DB plan (denormalized on the session). */}
        <div className="w-full shrink-0 lg:w-72">
          <p className="font-mono text-xs tracking-widest text-brand uppercase">
            {t("account.tier.title")}
          </p>
          <div className="mt-2 space-y-2">
            {/* Free tier */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-field border px-3 py-2.5",
                isPremium
                  ? "border-ink-600 bg-ink-900/40"
                  : "border-brand/30 bg-brand/5",
              )}
            >
              <CheckIcon
                size={16}
                className={cn(
                  "shrink-0",
                  isPremium ? "text-ink-500" : "text-brand",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-50">
                  {t("account.tier.free")}
                </p>
                <p className="truncate text-xs text-ink-400">
                  {t("account.tier.freeDesc")}
                </p>
              </div>
              {!isPremium && (
                <span className="shrink-0 font-mono text-[10px] tracking-wide text-brand uppercase">
                  {t("account.tier.current")}
                </span>
              )}
            </div>
            {/* Premium tier */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-field border px-3 py-2.5",
                isPremium
                  ? "border-brand/30 bg-brand/5"
                  : "border-ink-600 bg-ink-900/40",
              )}
            >
              {isPremium ? (
                <StarIcon size={16} className="shrink-0 text-brand" />
              ) : (
                <LockIcon size={16} className="shrink-0 text-ink-500" />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isPremium ? "text-ink-50" : "text-ink-300",
                  )}
                >
                  {t("account.tier.pro")}
                </p>
                <p className="truncate text-xs text-ink-500">
                  {t("account.tier.proDesc")}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 font-mono text-[10px] tracking-wide uppercase",
                  isPremium ? "text-brand" : "text-ink-500",
                )}
              >
                {isPremium ? t("account.tier.current") : t("account.tier.soon")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
