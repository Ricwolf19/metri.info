"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GithubIcon } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/shared/Container";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { isAuthPath, type RouteId, routePath } from "@/lib/i18n/routes";
import { webAppRepo } from "@/lib/site";

type FooterLink =
  | { id: RouteId; key: TranslationKey }
  | { href: string; key: TranslationKey };

const COLUMNS: { heading: TranslationKey; links: FooterLink[] }[] = [
  {
    heading: "footer.product",
    links: [
      { id: "tools", key: "nav.tools" },
      { id: "docs", key: "nav.docs" },
      { id: "download", key: "nav.download" },
    ],
  },
  {
    heading: "footer.resources",
    links: [{ href: webAppRepo, key: "nav.github" }],
  },
  {
    heading: "footer.company",
    links: [
      { id: "about", key: "footer.about" },
      { id: "privacy", key: "footer.privacy" },
      { id: "terms", key: "footer.terms" },
    ],
  },
];

const linkClass = "text-sm text-ink-300 transition-colors hover:text-ink-50";

export const Footer = () => {
  const { t, locale } = useI18n();
  const pathname = usePathname() ?? "/";
  const year = new Date().getFullYear();

  if (isAuthPath(pathname)) return null;

  return (
    <footer className="border-t border-ink-600/60 bg-ink-850">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm text-ink-300">{t("footer.tagline")}</p>
          <a
            href={webAppRepo}
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
            <h3 className="text-xs font-semibold tracking-wider text-ink-400 uppercase">
              {t(col.heading)}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.key}>
                  {"href" in link ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={linkClass}
                    >
                      {t(link.key)}
                    </a>
                  ) : (
                    <Link
                      href={routePath(link.id, locale)}
                      className={linkClass}
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
