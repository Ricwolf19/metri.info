"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/analytics", label: "PostHog" },
  { href: "/admin/analytics/google", label: "Google Analytics" },
  { href: "/admin/analytics/sentry", label: "Sentry" },
];

export const AnalyticsTabs = () => {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex gap-1 border-b border-ink-600">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px rounded-t-field border-b-2 px-4 py-2 text-sm font-medium transition-colors",
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
  );
};
