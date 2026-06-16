"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  GithubIcon,
  LogOutIcon,
  MenuIcon,
  ShieldIcon,
} from "@/components/icons";
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
import { webAppRepo } from "@/lib/site";
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
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "admin";

  // Auth + admin pages render their own shell — no site chrome.
  if (isChromelessPath(pathname)) return null;

  const signInHref = routePath("signIn", locale);
  const handleSignOut = () => {
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
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-accent" : "text-ink-300 hover:text-ink-50",
                )}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:justify-self-end">
          <a
            href={webAppRepo}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t("nav.github")}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-ink-200 transition-colors hover:bg-ink-700 hover:text-ink-50 sm:inline-flex"
          >
            <GithubIcon size={18} />
          </a>
          <LocaleToggle />
          <ThemeToggle />
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
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50"
                    >
                      <LogOutIcon size={18} />
                      {t("nav.signOut")}
                    </button>
                  </SheetClose>
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
