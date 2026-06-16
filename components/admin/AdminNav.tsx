"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV } from "@/components/admin/nav";
import { cn } from "@/lib/utils";

/** Sidebar navigation links with active-state highlighting. `/admin` matches
 * exactly (so it isn't active on every subroute); deeper sections match on
 * prefix. `onNavigate` lets the mobile sheet close on selection. */
export const AdminNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-ink-700 text-ink-50"
                : "text-ink-300 hover:bg-ink-800 hover:text-ink-50",
            )}
          >
            <Icon
              size={18}
              className={active ? "text-accent" : "text-ink-400"}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
};
