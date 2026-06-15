"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { GithubIcon, MenuIcon, XIcon } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Container } from "@/components/shared/Container";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { isAuthPath, type RouteId, routePath } from "@/lib/i18n/routes";
import { webAppRepo } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV: { id: RouteId; key: TranslationKey }[] = [
  { id: "tools", key: "nav.tools" },
  { id: "docs", key: "nav.docs" },
  { id: "download", key: "nav.download" },
];

export const Header = () => {
  const { t, locale } = useI18n();
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  // Auth pages render their own full-screen layout — no site chrome.
  if (isAuthPath(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-ink-600/60 bg-ink-900/80 backdrop-blur-lg">
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
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

        <div className="flex items-center gap-2">
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
          <Link
            href={routePath("signIn", locale)}
            className="hidden h-9 items-center rounded-lg bg-ink-50 px-3.5 text-sm font-semibold text-ink-900 transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            {t("nav.signIn")}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("nav.close") : t("nav.menu")}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-ink-200 transition-colors hover:bg-ink-700 hover:text-ink-50 md:hidden"
          >
            {open ? <XIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </Container>

      {open && (
        <nav className="border-t border-ink-600/60 bg-ink-900 md:hidden">
          <Container className="flex flex-col py-3">
            {NAV.map(({ id, key }) => (
              <Link
                key={id}
                href={routePath(id, locale)}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink-200 hover:bg-ink-800 hover:text-ink-50"
              >
                {t(key)}
              </Link>
            ))}
            <Link
              href={routePath("signIn", locale)}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-ink-50 px-3 py-3 text-center text-base font-semibold text-ink-900"
            >
              {t("nav.signIn")}
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
};
