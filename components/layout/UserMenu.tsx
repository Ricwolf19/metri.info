"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { GearIcon, LogOutIcon, ShieldIcon, StarIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/Spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth/client";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

/** Header account menu — shown when a session exists. Surfaces the admin link
 * for admins and a sign-out action. The session is read client-side so pages
 * stay statically generated. */
export const UserMenu = ({ className }: { className?: string }) => {
  const { data } = useSession();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  if (!data) return null;
  const user = data.user;
  const role = (user as { role?: string }).role;
  const initial = (user.name || user.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  const handleSignOut = (e: Event) => {
    e.preventDefault();
    if (signingOut) return;
    setSigningOut(true);
    signOut().finally(() => router.refresh());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={user.name || user.email}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-600 bg-ink-800 text-sm font-semibold text-ink-100 transition-colors hover:bg-ink-700 hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-ink-500/50 focus-visible:outline-none",
          className,
        )}
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="truncate text-sm font-medium text-ink-50">
            {user.name}
          </p>
          <p className="truncate text-xs text-ink-400">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={routePath("account", locale)}>
            <GearIcon size={15} />
            {t("nav.account")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={routePath("activity", locale)}>
            <StarIcon size={15} />
            {t("nav.activity")}
          </Link>
        </DropdownMenuItem>
        {role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldIcon size={15} />
              {t("nav.admin")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={handleSignOut} disabled={signingOut}>
          {signingOut ? <Spinner size="sm" /> : <LogOutIcon size={15} />}
          {signingOut ? t("nav.signingOut") : t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
