"use client";

import { invalidateListCache } from "listkit";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ArrowLeftIcon,
  BookIcon,
  BookmarkIcon,
  CalculatorIcon,
  ChevronRightIcon,
  DownloadIcon,
  GearIcon,
  GithubIcon,
  type IconProps,
  InfoIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  ShieldIcon,
  StarIcon,
} from "@/components/icons";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { Logo } from "@/components/layout/Logo";
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
import { Spinner } from "@/components/ui/Spinner";
import { signOut, useSession } from "@/lib/auth/client";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import {
  isAdminPath,
  isAuthPath,
  type RouteId,
  routePath,
} from "@/lib/i18n/routes";
import { ADMIN_NAV_GROUPS } from "@/components/admin/nav";
import { mobileAppReleases, webAppRepo } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV: {
  id: RouteId;
  key: TranslationKey;
  icon: React.ComponentType<IconProps>;
}[] = [
  { id: "tools", key: "nav.tools", icon: CalculatorIcon },
  { id: "docs", key: "nav.docs", icon: BookIcon },
  { id: "download", key: "nav.download", icon: DownloadIcon },
  { id: "about", key: "footer.about", icon: InfoIcon },
  { id: "contact", key: "nav.contact", icon: MailIcon },
];

type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: React.ComponentType<IconProps>;
  exact?: boolean;
};

/** A section is current on its index page and on anything nested under it
 * (or only on its own page when `exact`, so "Overview" is not lit everywhere). */
const isCurrent = (pathname: string, item: Pick<NavItem, "href" | "exact">) =>
  item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

const ADMIN_ITEMS: NavItem[] = ADMIN_NAV_GROUPS.flatMap((g) =>
  g.items.map((i) => ({
    id: i.id,
    href: i.href,
    label: i.label,
    icon: i.icon ?? ShieldIcon,
    exact: i.exact,
  })),
);

const iconButtonClass = buttonVariants({ variant: "secondary", size: "icon" });

const sheetRowClass =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-50";

const chipClass =
  "inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5 text-sm text-ink-200 transition-colors hover:border-ink-500 hover:text-ink-50";

export const Header = () => {
  const { t, locale } = useI18n();
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "admin";

  // A back/forward swipe changes the route under a non-modal drawer.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  if (isAuthPath(pathname)) return null;

  // On /admin the bar carries the admin sections (EN-only, like the area
  // itself); everywhere else the public ones. Same component, same indicator.
  const adminArea = isAdminPath(pathname);
  const items: NavItem[] = adminArea
    ? ADMIN_ITEMS
    : NAV.map(({ id, key, icon }) => ({
        id,
        href: routePath(id, locale),
        label: t(key),
        icon,
      }));

  const signInHref = routePath("signIn", locale);
  const handleSignOut = () => {
    if (signingOut) return;
    setSigningOut(true);
    invalidateListCache();
    signOut().finally(() => router.refresh());
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-600/60 bg-ink-900/80 backdrop-blur-lg">
      <Container className="flex h-16 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-2 md:justify-self-start">
          <Logo />
          {adminArea && (
            <span className="rounded-md border border-brand/30 bg-brand/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-brand uppercase">
              Admin
            </span>
          )}
        </div>

        <nav className="hidden items-center gap-1 justify-self-center md:flex">
          {items.map((item) => {
            const { id, href, label } = item;
            const active = isCurrent(pathname, item);
            return (
              <Link
                key={id}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative px-3 py-2 font-mono text-xs font-medium tracking-wider uppercase transition-colors",
                  active ? "text-ink-50" : "text-ink-400 hover:text-ink-100",
                )}
              >
                {label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 -bottom-[5px] h-0.5 origin-left rounded-full bg-brand transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:justify-self-end">
          {!adminArea && <LocaleToggle />}

          <a
            href={webAppRepo}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t("nav.github")}
            className={cn(iconButtonClass, "hidden sm:inline-flex")}
          >
            <GithubIcon size={17} />
          </a>
          {session ? (
            <UserMenu className="hidden sm:inline-flex" />
          ) : (
            <Link
              href={signInHref}
              className={cn(
                buttonVariants({ size: "sm" }),
                "hidden sm:inline-flex",
              )}
            >
              {t("nav.signIn")}
            </Link>
          )}

          {/* Phone menu: a top drawer. Non-modal + its own backdrop so the page
              underneath keeps its layout (no scroll-lock padding, no body
              pointer-events toggle), which is what used to shove the content. */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
            <SheetTrigger
              aria-label={t("nav.menu")}
              className={cn(iconButtonClass, "md:hidden")}
            >
              <MenuIcon size={18} />
            </SheetTrigger>
            <SheetContent side="top" backdrop className="gap-0 p-5 pb-6">
              <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>
              {/* The logo is a plain link; close the drawer on the way out so
                  the home page is not left under an open menu. */}
              <div
                className="inline-flex"
                onClickCapture={() => setMenuOpen(false)}
              >
                <Logo />
              </div>

              <p className="mt-6 px-1 font-mono text-[11px] font-medium tracking-widest text-ink-500 uppercase">
                {t("nav.sections")}
              </p>
              <nav className="mt-2 grid gap-1" aria-label={t("nav.sections")}>
                {items.map((item) => {
                  const { id, href, label, icon: Icon } = item;
                  const active = isCurrent(pathname, item);
                  return (
                    <SheetClose asChild key={id}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                          active
                            ? "bg-ink-800 text-ink-50"
                            : "text-ink-200 hover:bg-ink-800/60 hover:text-ink-50",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                            active
                              ? "bg-brand/15 text-brand"
                              : "bg-ink-800 text-ink-400 group-hover:text-ink-200",
                          )}
                        >
                          <Icon size={18} />
                        </span>
                        <span className="relative text-base font-semibold">
                          {label}
                          {active && (
                            <span
                              aria-hidden
                              className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-brand"
                            />
                          )}
                        </span>
                        {active && (
                          <span className="sr-only">
                            {t("nav.currentPage")}
                          </span>
                        )}
                        <ChevronRightIcon
                          size={16}
                          className="ml-auto shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>

              <p className="mt-5 px-1 font-mono text-[11px] font-medium tracking-widest text-ink-500 uppercase">
                {t("nav.links")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 px-1">
                {adminArea && (
                  <SheetClose asChild>
                    <Link
                      href={routePath("home", locale)}
                      className={chipClass}
                    >
                      <ArrowLeftIcon size={15} />
                      {t("nav.home")}
                    </Link>
                  </SheetClose>
                )}
                <SheetClose asChild>
                  <a
                    href={mobileAppReleases}
                    target="_blank"
                    rel="noreferrer"
                    className={chipClass}
                  >
                    <BookmarkIcon size={15} className="text-brand" />
                    {t("nav.changelog")}
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href={webAppRepo}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={chipClass}
                  >
                    <GithubIcon size={15} />
                    {t("nav.github")}
                  </a>
                </SheetClose>
              </div>

              <div className="mt-5 border-t border-ink-700 pt-4">
                {session ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-1.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-700 text-sm font-semibold text-ink-50 ring-2 ring-brand/70">
                        {(session.user.name || session.user.email)
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink-50">
                          {session.user.name}
                        </span>
                        <span className="block truncate text-xs text-ink-400">
                          {session.user.email}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      <SheetClose asChild>
                        <Link
                          href={routePath("account", locale)}
                          className={sheetRowClass}
                        >
                          <GearIcon size={17} className="text-ink-400" />
                          {t("nav.account")}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href={routePath("activity", locale)}
                          className={sheetRowClass}
                        >
                          <StarIcon size={17} className="text-ink-400" />
                          {t("nav.activity")}
                        </Link>
                      </SheetClose>
                      {isAdmin && (
                        <SheetClose asChild>
                          <Link href="/admin" className={sheetRowClass}>
                            <ShieldIcon size={17} className="text-ink-400" />
                            {t("nav.admin")}
                          </Link>
                        </SheetClose>
                      )}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className={cn(sheetRowClass, "disabled:opacity-60")}
                      >
                        {signingOut ? (
                          <Spinner size="sm" />
                        ) : (
                          <LogOutIcon size={17} className="text-ink-400" />
                        )}
                        {signingOut ? t("nav.signingOut") : t("nav.signOut")}
                      </button>
                    </div>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Link
                      href={signInHref}
                      className={cn(
                        buttonVariants({ variant: "brand", size: "lg" }),
                        "w-full",
                      )}
                    >
                      {t("nav.signIn")}
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
};
