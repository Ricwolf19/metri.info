"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  BookmarkIcon,
  GearIcon,
  GithubIcon,
  InfoIcon,
  LogOutIcon,
  MenuIcon,
  ShieldIcon,
  StarIcon,
} from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { webAppRepo } from "@/lib/site";
import { Spinner } from "@/components/ui/Spinner";
import { Logo } from "@/components/layout/Logo";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { Container } from "@/components/shared/Container";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut, useSession } from "@/lib/auth/client";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { isChromelessPath, type RouteId, routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

const NAV: { id: RouteId; key: TranslationKey }[] = [
  { id: "tools", key: "nav.tools" },
  { id: "docs", key: "nav.docs" },
  { id: "download", key: "nav.download" },
  { id: "contact", key: "nav.contact" },
];

export const Header = () => {
  const { t, locale } = useI18n();
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "admin";

  if (isChromelessPath(pathname)) return null;

  const signInHref = routePath("signIn", locale);
  const handleSignOut = () => {
    if (signingOut) return;
    setSigningOut(true);
    signOut().finally(() => router.refresh());
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-600/60 bg-ink-900/80 backdrop-blur-lg">
      <Container className="flex h-16 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        <Logo className="md:justify-self-start" />

        <nav className="hidden items-center gap-1 justify-self-center md:flex">
          {NAV.map(({ id, key }) => {
            const href = routePath(id, locale);
            const active = pathname.startsWith(href);
            return (
              <Link
                key={id}
                href={href}
                className={cn(
                  "relative px-3 py-2 font-mono text-xs font-medium tracking-wider uppercase transition-colors",
                  active ? "text-ink-50" : "text-ink-400 hover:text-ink-100",
                )}
              >
                {t(key)}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-px h-px bg-brand"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:justify-self-end">
          <LocaleToggle />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={t("nav.more")}
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-ink-300 transition-colors hover:bg-ink-700 hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:outline-none sm:inline-flex"
            >
              <span className="flex items-center gap-[3px]">
                <span className="h-1 w-1 rounded-full bg-current" />
                <span className="h-1 w-1 rounded-full bg-current" />
                <span className="h-1 w-1 rounded-full bg-current" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={routePath("changelog", locale)}>
                  <BookmarkIcon size={15} />
                  {t("nav.changelog")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={routePath("about", locale)}>
                  <InfoIcon size={15} />
                  {t("footer.about")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={webAppRepo} target="_blank" rel="noreferrer noopener">
                  <GithubIcon size={15} />
                  {t("nav.github")}
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {session ? (
            <UserMenu className="hidden sm:inline-flex" />
          ) : (
            <Link
              href={signInHref}
              className={cn(
                buttonVariants({ size: "sm" }),
                "hidden transition-transform hover:scale-[1.03] sm:inline-flex",
              )}
            >
              {t("nav.signIn")}
            </Link>
          )}

          <Sheet>
            <SheetTrigger
              aria-label={t("nav.menu")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-ink-200 transition-colors hover:bg-ink-700 hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-ink-500/50 focus-visible:outline-none md:hidden"
            >
              <MenuIcon size={18} />
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>
              <Logo />
              <nav className="mt-8 flex flex-col gap-1">
                {NAV.map(({ id, key }) => (
                  <SheetClose asChild key={id}>
                    <Link
                      href={routePath(id, locale)}
                      className="rounded-lg px-3 py-3 text-base font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50"
                    >
                      {t(key)}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    href={routePath("changelog", locale)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50"
                  >
                    {t("nav.changelog")}
                  </Link>
                </SheetClose>
              </nav>

              {session ? (
                <div className="mt-4 border-t border-ink-600 pt-4">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium text-ink-50">
                      {session.user.name}
                    </p>
                    <p className="truncate text-xs text-ink-400">
                      {session.user.email}
                    </p>
                  </div>
                  <SheetClose asChild>
                    <Link
                      href={routePath("account", locale)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50"
                    >
                      <GearIcon size={18} />
                      {t("nav.account")}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href={routePath("activity", locale)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50"
                    >
                      <StarIcon size={18} />
                      {t("nav.activity")}
                    </Link>
                  </SheetClose>
                  {isAdmin && (
                    <SheetClose asChild>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50"
                      >
                        <ShieldIcon size={18} />
                        {t("nav.admin")}
                      </Link>
                    </SheetClose>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50 disabled:opacity-60"
                  >
                    {signingOut ? (
                      <Spinner size="sm" />
                    ) : (
                      <LogOutIcon size={18} />
                    )}
                    {signingOut ? t("nav.signingOut") : t("nav.signOut")}
                  </button>
                </div>
              ) : (
                <SheetClose asChild>
                  <Link
                    href={signInHref}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "mt-4 w-full",
                    )}
                  >
                    {t("nav.signIn")}
                  </Link>
                </SheetClose>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
};
