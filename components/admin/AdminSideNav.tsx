"use client";

import { ADMIN_NAV_GROUPS } from "@/components/admin/nav";
import { SideNav } from "@/components/ui/SideNav";

/** The admin rail. Owns the nav import so the server-rendered shell never has
 * to hand icon components (functions) across the client boundary. */
export const AdminSideNav = () => (
  <SideNav
    groups={ADMIN_NAV_GROUPS}
    layout="vertical"
    ariaLabel="Admin sections"
  />
);
