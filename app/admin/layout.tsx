import type { Metadata } from "next";

import { AdminSignOut } from "@/app/admin/AdminSignOut";
import { AdminBackToSite } from "@/components/admin/AdminBackToSite";
import { AdminMobileBar } from "@/components/admin/AdminMobileBar";
import { AdminNav } from "@/components/admin/AdminNav";
import { MetriMark } from "@/components/layout/MetriMark";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin · Metri",
  robots: { index: false, follow: false },
};

/** Admin shell. Guards every /admin/* route in one place via requireAdmin(),
 * then frames children with a persistent desktop sidebar (brand + section nav +
 * sign-out) that collapses to a top bar with a sheet menu on mobile. */
const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const admin = await requireAdmin();

  return (
    <div className="min-h-dvh bg-ink-900 lg:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-600/60 bg-ink-850 lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <div className="flex items-center gap-2 border-b border-ink-600/60 px-5 py-4">
          <MetriMark className="h-7 w-7" />
          <span className="font-sans text-lg font-bold tracking-tight text-ink-50">
            Metri
          </span>
          <span className="rounded-md border border-ink-600 bg-ink-800 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
            Admin
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <AdminNav />
        </div>

        <div className="space-y-2 border-t border-ink-600/60 p-4">
          <p className="truncate text-xs text-ink-400">{admin.email}</p>
          <AdminBackToSite />
          <AdminSignOut />
        </div>
      </aside>

      <AdminMobileBar signOut={<AdminSignOut />} />

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
