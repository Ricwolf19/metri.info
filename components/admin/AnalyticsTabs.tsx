"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ScrollHint } from "@/components/ui/ScrollHint";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/analytics", label: "PostHog" },
  { href: "/admin/analytics/google", label: "Google Analytics" },
  { href: "/admin/analytics/sentry", label: "Sentry" },
];

export const AnalyticsTabs = () => {
  const pathname = usePathname();
  return (
    <ScrollHint className="mb-6">
      <nav
        aria-label="Analytics sources"
        className="flex gap-1 overflow-x-auto border-b border-ink-600"
      >
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-t-field border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "border-brand text-ink-50"
                  : "border-transparent text-ink-400 hover:text-ink-100",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </ScrollHint>
  );
};
