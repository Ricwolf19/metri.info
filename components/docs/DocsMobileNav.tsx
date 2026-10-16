"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { BookIcon, MenuIcon } from "@/components/icons";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";

type Props = Omit<React.ComponentProps<typeof DocsSidebar>, "onNavigate">;

/** Below `lg` the docs tree lives in a left sheet behind a full-width button,
 * since the desktop sidebar is hidden there. Closes on navigation. */
export const DocsMobileNav = (props: Props) => {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = props.docs.find(
    (d) => pathname === `${props.basePath}/${d.slug}`,
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="mb-6 flex w-full items-center gap-3 rounded-card border border-ink-600 bg-ink-800 px-4 py-3 text-left text-sm text-ink-200 transition-colors hover:border-ink-500 hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none lg:hidden">
        <BookIcon size={18} className="shrink-0 text-brand" />
        <span className="min-w-0 flex-1 truncate font-medium">
          {current?.title ?? t("docs.title")}
        </span>
        <MenuIcon size={18} className="shrink-0 text-ink-400" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[85%] max-w-sm overflow-y-auto">
        <SheetTitle className="mb-6 flex items-center gap-2 text-base font-bold text-ink-50">
          <BookIcon size={18} className="text-brand" />
          {t("docs.title")}
        </SheetTitle>
        <DocsSidebar {...props} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};
