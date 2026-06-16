"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GithubIcon, MailIcon } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/shared/Container";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { isChromelessPath, type RouteId, routePath } from "@/lib/i18n/routes";
import { webAppRepo } from "@/lib/site";

const CONTACT_EMAIL = "rhtc19@gmail.com";
const DEVELOPER_URL = "https://www.ricardotapia.dev";

type Column = {
  heading: TranslationKey;
  links: { id: RouteId; key: TranslationKey }[];
};

/** Top calculators — internal links that also feed crawlers the money pages. */
const CALCULATORS: { id: RouteId; key: TranslationKey }[] = [
  { id: "onerm", key: "tools.onerm.title" },
  { id: "tdee", key: "tools.bmr.title" },
  { id: "macros", key: "tools.macros.title" },
  { id: "bodyfat", key: "tools.bodyfat.title" },
  { id: "bmi", key: "tools.ideal.title" },
  { id: "ffmi", key: "tools.ffmi.title" },
];

const COLUMNS: Column[] = [
  {
    heading: "footer.product",
    links: [
      { id: "tools", key: "nav.tools" },
      { id: "docs", key: "nav.docs" },
      { id: "download", key: "nav.download" },
    ],
  },
  {
    heading: "footer.company",
    links: [
      { id: "about", key: "footer.about" },
      { id: "contact", key: "footer.contact" },
      { id: "privacy", key: "footer.privacy" },
      { id: "terms", key: "footer.terms" },
    ],
  },
];

const linkClass = "text-sm text-ink-300 transition-colors hover:text-ink-50";
const iconLinkClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-ink-300 transition-colors hover:bg-ink-700 hover:text-ink-50";

export const Footer = () => {
  const { t, locale } = useI18n();
  const pathname = usePathname() ?? "/";
  const year = new Date().getFullYear();

  if (isChromelessPath(pathname)) return null;

  return (
    <footer className="border-t border-ink-600/60 bg-ink-850">
      <Container className="grid gap-10 py-16 md:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-300">
            {t("footer.tagline2")}
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href={webAppRepo}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={t("nav.github")}
              className={iconLinkClass}
            >
              <GithubIcon size={18} />
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label={t("nav.contact")}
              className={iconLinkClass}
            >
              <MailIcon size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-wider text-ink-400 uppercase">
            {t("footer.calculators")}
          </h3>
          <ul className="mt-4 space-y-3">
            {CALCULATORS.map((link) => (
              <li key={link.id}>
                <Link href={routePath(link.id, locale)} className={linkClass}>
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h3 className="text-xs font-semibold tracking-wider text-ink-400 uppercase">
              {t(col.heading)}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.id}>
                  <Link href={routePath(link.id, locale)} className={linkClass}>
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-ink-600/60">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-400 sm:flex-row">
          <p>
            © {year} Metri. {t("footer.rights")}
          </p>
          <p className="flex items-center gap-1.5">
            <span>{t("footer.builtWith")}</span>
            <span aria-hidden>·</span>
            <span>
              {t("footer.builtBy")}{" "}
              <a
                href={DEVELOPER_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-ink-300 transition-colors hover:text-accent"
              >
                Ricardo Tapia
              </a>
            </span>
          </p>
        </Container>
      </div>
    </footer>
  );
};
