"use client";

import { useState } from "react";

import { AdminBackToSite } from "@/components/admin/AdminBackToSite";
import { ADMIN_NAV_GROUPS } from "@/components/admin/nav";
import { MenuIcon } from "@/components/icons";
import { MetriMark } from "@/components/layout/MetriMark";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SideNav } from "@/components/ui/SideNav";

/** Mobile-only top bar: brand + a hamburger that opens the nav in a left sheet.
 * The sheet closes on selection. `signOut` is passed in from the layout (a
 * server-rendered control) so the sign-out logic stays in one place. */
export const AdminMobileBar = ({ signOut }: { signOut: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-ink-600/60 bg-ink-850 px-4 lg:hidden">
      <div className="flex items-center gap-2">
        <MetriMark className="h-6 w-6" />
        <span className="font-sans text-base font-bold tracking-tight text-ink-50">
          Metri
        </span>
        <span className="rounded-md border border-ink-600 bg-ink-800 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
          Admin
        </span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Open admin menu"
          className={buttonVariants({ variant: "secondary", size: "icon" })}
        >
          <MenuIcon size={18} />
        </SheetTrigger>
        <SheetContent side="left" className="gap-0">
          <SheetTitle className="mb-6 flex items-center gap-2 text-base font-bold text-ink-50">
            <MetriMark className="h-6 w-6" />
            Metri
            <span className="rounded-md border border-ink-600 bg-ink-800 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
              Admin
            </span>
          </SheetTitle>
          <SideNav
            groups={ADMIN_NAV_GROUPS}
            layout="vertical"
            ariaLabel="Admin sections"
            onNavigate={() => setOpen(false)}
          />
          <div className="mt-auto space-y-2 pt-6">
            <AdminBackToSite />
            {signOut}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};
