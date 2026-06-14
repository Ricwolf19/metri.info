"use client";

import Link from "next/link";

import { GithubIcon } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/shared/Container";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { repos } from "@/lib/site";

const COLUMNS: { heading: TranslationKey; links: { href: string; key: TranslationKey }[] }[] = [
  {
    heading: "footer.product",
    links: [
      { href: "/tools", key: "nav.tools" },
      { href: "/exercises", key: "nav.exercises" },
      { href: "/programs", key: "nav.programs" },
      { href: "/download", key: "nav.download" },
    ],
  },
  {
    heading: "footer.resources",
    links: [
      { href: "/docs", key: "nav.docs" },
      { href: repos.app, key: "nav.github" },
      { href: repos.web, key: "footer.siteSource" },
    ],
  },
  {
    heading: "footer.company",
    links: [
      { href: "/about", key: "footer.about" },
      { href: "/privacy", key: "footer.privacy" },
      { href: "/terms", key: "footer.terms" },
    ],
  },
];

export const Footer = () => {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-600/60 bg-ink-850">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm text-ink-300">{t("footer.tagline")}</p>
          <a
            href={repos.app}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex items-center gap-2 text-sm text-ink-300 transition-colors hover:text-accent"
          >
            <GithubIcon size={16} />
            {t("oss.cta")}
          </a>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              {t(col.heading)}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm text-ink-300 transition-colors hover:text-ink-50"
                    >
                      {t(link.key)}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-ink-300 transition-colors hover:text-ink-50"
                    >
                      {t(link.key)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-ink-600/60">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-400 sm:flex-row">
          <p>
            © {year} METRI. {t("footer.rights")}
          </p>
          <p>{t("footer.builtWith")}</p>
        </Container>
      </div>
    </footer>
  );
};
