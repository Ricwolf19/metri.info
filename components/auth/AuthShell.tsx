import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";
import { MetriMark } from "@/components/layout/MetriMark";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";

/** Full-screen split layout for auth pages: brand panel + form column. */
export const AuthShell = ({
  locale,
  title,
  subtitle,
  children,
}: {
  locale: Locale;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => {
  const t = createT(locale);
  const home = routePath("home", locale);

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 15%, rgba(190,248,43,0.22), transparent 55%), radial-gradient(circle at 85% 90%, rgba(190,248,43,0.10), transparent 50%)",
          }}
        />
        <Link
          href={home}
          className="relative z-10 inline-flex items-center gap-2"
        >
          <MetriMark className="h-8 w-8 text-lime-400" />
          <span className="text-lg font-bold tracking-tight text-white">
            METRI
          </span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-4xl leading-tight font-bold text-white">
            {t("auth.brandTitle")}
            <span className="mt-1 block text-lime-400">
              {t("auth.brandHighlight")}
            </span>
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            {t("auth.brandSubtitle")}
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          {t("footer.builtWith")}
        </p>
      </aside>

      {/* Form column */}
      <main className="flex flex-1 flex-col bg-ink-900">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <Link href={home} className="inline-flex lg:hidden">
            <MetriMark className="h-7 w-7" />
          </Link>
          <Link
            href={home}
            className="ml-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold tracking-wider text-ink-300 uppercase transition hover:text-accent"
          >
            <ArrowLeftIcon size={15} />
            {t("auth.backHome")}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-ink-50 sm:text-3xl">
                {title}
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-300">
                {subtitle}
              </p>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
