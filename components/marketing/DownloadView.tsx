import Link from "next/link";

import {
  AppleIcon,
  ArrowRightIcon,
  GithubIcon,
  SmartphoneIcon,
} from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { appDistribution, mobileAppRepo } from "@/lib/site";

/** Download page body — shared by /download (EN) and /es/descargar (ES).
 * While the app is in development it shows a "coming soon" state. */
export const DownloadView = ({ locale }: { locale: Locale }) => {
  const t = createT(locale);
  const isDev = appDistribution.status === "development";

  return (
    <Container className="py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        {isDev && (
          <span className="inline-flex items-center gap-2 rounded-full border border-flame/30 bg-flame/10 px-3 py-1 text-xs font-medium text-flame">
            <span className="h-1.5 w-1.5 rounded-full bg-flame" />
            {t("download.devBadge")}
          </span>
        )}

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink-50 sm:text-5xl">
          {isDev ? t("download.devTitle") : t("download.title")}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-300">
          {isDev ? t("download.devBody") : t("download.subtitle")}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={routePath("tools", locale)}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink-50 px-6 font-semibold text-ink-900 transition-transform hover:scale-[1.02]"
          >
            {t("download.devCtaTools")}
            <ArrowRightIcon size={18} />
          </Link>
          <a
            href={mobileAppRepo}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink-600 bg-ink-800 px-6 font-semibold text-ink-50 transition-colors hover:bg-ink-700"
          >
            <GithubIcon size={18} />
            {t("download.devCtaGithub")}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="text-center text-xs font-semibold tracking-wider text-ink-400 uppercase">
          {t("download.platformsTitle")}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { icon: AppleIcon, label: t("download.iosSoon") },
            { icon: SmartphoneIcon, label: t("download.androidSoon") },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-dashed border-ink-600 bg-ink-850 px-5 py-4 text-ink-300"
            >
              <Icon size={22} className="text-ink-400" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-sm text-ink-400">
          {t("download.notifyNote")}
        </p>
      </div>
    </Container>
  );
};
