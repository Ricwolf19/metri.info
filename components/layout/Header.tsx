"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { GithubIcon, MenuIcon, XIcon } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Container } from "@/components/shared/Container";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { primaryRepo } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV: { href: string; key: TranslationKey }[] = [
  { href: "/docs", key: "nav.docs" },
  { href: "/tools", key: "nav.tools" },
  { href: "/exercises", key: "nav.exercises" },
  { href: "/programs", key: "nav.programs" },
  { href: "/download", key: "nav.download" },
];

export const Header = () => {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-600/60 bg-ink-900/80 backdrop-blur-lg">
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(({ href, key }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-accent"
                    : "text-ink-300 hover:text-ink-50",
                )}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={primaryRepo}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t("nav.github")}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-ink-200 transition-colors hover:bg-ink-700 hover:text-ink-50 sm:inline-flex"
          >
            <GithubIcon size={18} />
          </a>
          <LocaleToggle />
          <ThemeToggle />
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
            {NAV.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink-200 hover:bg-ink-800 hover:text-ink-50"
              >
                {t(key)}
              </Link>
            ))}
          </Container>
        </nav>
      )}
    </header>
  );
};
