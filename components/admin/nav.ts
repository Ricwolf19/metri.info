import {
  CalculatorIcon,
  HomeIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@/components/icons";
import type { SideNavGroup, SideNavItem } from "@/components/ui/SideNav";

/** Admin sections, in display order; the site header renders them on admin
 * paths (desktop bar and phone drawer). `/admin` matches exactly so it isn't
 * active on every subroute. */
const ADMIN_NAV: SideNavItem[] = [
  {
    id: "overview",
    href: "/admin",
    label: "Overview",
    icon: HomeIcon,
    exact: true,
  },
  {
    id: "analytics",
    href: "/admin/analytics",
    label: "Analytics",
    icon: TrendingUpIcon,
  },
  { id: "users", href: "/admin/users", label: "Users", icon: UsersIcon },
  {
    id: "calculations",
    href: "/admin/calculations",
    label: "Calculations",
    icon: CalculatorIcon,
  },
];

export const ADMIN_NAV_GROUPS: SideNavGroup[] = [{ items: ADMIN_NAV }];
