import type { ComponentType } from "react";

import {
  CalculatorIcon,
  HomeIcon,
  type IconProps,
  LinkIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@/components/icons";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
};

/** Admin sidebar sections, in display order. Single source of truth shared by
 * the desktop sidebar and the mobile sheet. */
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: HomeIcon },
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUpIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  {
    href: "/admin/calculations",
    label: "Calculations",
    icon: CalculatorIcon,
  },
  { href: "/admin/services", label: "Services", icon: LinkIcon },
];
