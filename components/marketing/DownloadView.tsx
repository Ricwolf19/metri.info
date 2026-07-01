import Link from "next/link";

import {
  AppleIcon,
  ArrowRightIcon,
  GithubIcon,
  SmartphoneIcon,
} from "@/components/icons";
import { InstallPwaCard } from "@/components/pwa/InstallPwaCard";
import { Container } from "@/components/shared/Container";
import { buttonVariants } from "@/components/ui/button";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { appDistribution, mobileAppRepo } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Download page body — shared by /download (EN) and /es/descargar (ES).
 * While the app is in development it shows a "coming soon" state.
 *
 * Two-column layout: the pitch on the left, the "coming to" platforms in a side
 * panel on the right — uses the horizontal space instead of a tall, narrow
 * column, so the page stays compact and vertically balanced. */
export const DownloadView = ({ locale }: { locale: Locale }) => {
  const t = createT(locale);
  const isDev = appDistribution.status === "development";

  const platforms = [
    { icon: AppleIcon, label: t("download.iosSoon") },
    { icon: SmartphoneIcon, label: t("download.androidSoon") },
  ];

  return (
    <Container className="py-14 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left — pitch */}
        <div>
          <div className="flex size-14 items-center justify-center rounded-2xl border border-ink-600 bg-ink-800 text-accent">
            <SmartphoneIcon size={28} />
          </div>

          {isDev && (
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-flame/30 bg-flame/10 px-3 py-1 text-xs font-medium text-flame">
              <span className="h-1.5 w-1.5 rounded-full bg-flame" />
              {t("download.devBadge")}
            </span>
          )}

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-ink-50 sm:text-5xl lg:text-6xl">
            {isDev ? t("download.devTitle") : t("download.title")}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-pretty text-ink-300">
            {isDev ? t("download.devBody") : t("download.subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={routePath("tools", locale)}
              className={cn(
                buttonVariants({ size: "lg" }),
                "transition-transform hover:scale-[1.02]",
              )}
            >
              {t("download.devCtaTools")}
              <ArrowRightIcon size={18} />
            </Link>
            <a
              href={mobileAppRepo}
              target="_blank"
              rel="noreferrer noopener"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <GithubIcon size={18} />
              {t("download.devCtaGithub")}
            </a>
          </div>
        </div>

        {/* Right — platforms panel */}
        <div className="rounded-card border border-ink-600 bg-ink-850/60 p-6 sm:p-8">
          <h2 className="text-xs font-semibold tracking-wider text-ink-400 uppercase">
            {t("download.platformsTitle")}
          </h2>
          <div className="mt-5 space-y-3">
            {platforms.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-dashed border-ink-600 bg-ink-850 px-5 py-4 text-ink-300"
              >
                <Icon size={22} className="shrink-0 text-ink-400" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-ink-400">
            {t("download.notifyNote")}
          </p>
        </div>
      </div>

      <InstallPwaCard />
    </Container>
  );
};
