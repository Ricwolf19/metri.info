"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { ScrollHint } from "@/components/ui/ScrollHint";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/analytics", label: "Behavior", source: "PostHog" },
  { href: "/admin/analytics/heatmaps", label: "Heatmaps", source: "PostHog" },
  { href: "/admin/analytics/google", label: "Traffic", source: "GA4" },
  {
    href: "/admin/analytics/search",
    label: "Search",
    source: "Search Console",
  },
  { href: "/admin/analytics/sentry", label: "Errors", source: "Sentry" },
];

/** Only the date window travels between tabs; each tab's own controls
 * (heatmap page, device…) mean nothing on the others. */
const RANGE_KEYS = ["range", "from", "to"];

/** One tab per dashboard, each named with the source it reads; `query`
 * (the date window) rides along on every link. */
export const AnalyticsTabStrip = ({ query = "" }: { query?: string }) => {
  const pathname = usePathname();
  return (
    <ScrollHint className="mb-6">
      <nav
        aria-label="Analytics dashboards"
        className="flex gap-1 overflow-x-auto border-b border-ink-600"
      >
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={query ? `${tab.href}?${query}` : tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-baseline gap-2 rounded-t-field border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "border-brand text-ink-50"
                  : "border-transparent text-ink-400 hover:text-ink-100",
              )}
            >
              {tab.label}
              <span className="font-mono text-[10px] tracking-wide text-ink-500 uppercase">
                {tab.source}
              </span>
            </Link>
          );
        })}
      </nav>
    </ScrollHint>
  );
};

/** The strip, carrying the current date window from the URL. */
export const AnalyticsTabs = () => {
  const searchParams = useSearchParams();
  const range = new URLSearchParams();
  for (const key of RANGE_KEYS) {
    const v = searchParams.get(key);
    if (v) range.set(key, v);
  }
  return <AnalyticsTabStrip query={range.toString()} />;
};
