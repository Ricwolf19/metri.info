import Link from "next/link";

import {
  AppleIcon,
  ArrowRightIcon,
  CheckIcon,
  CloudSyncIcon,
  DownloadIcon,
  GithubIcon,
  type IconProps,
  RefreshIcon,
  ShieldIcon,
  SmartphoneIcon,
  WifiOffIcon,
} from "@/components/icons";
import { ApkQr } from "@/components/marketing/ApkQr";
import { DownloadButtons } from "@/components/marketing/DownloadButtons";
import { ReleaseNotes } from "@/components/marketing/ReleaseNotes";
import { TourScreen } from "@/components/marketing/tour/TourScreen";
import { Container } from "@/components/shared/Container";
import { CopyButton } from "@/components/shared/CopyButton";
import { PageHero } from "@/components/shared/PageHero";
import { buttonVariants } from "@/components/ui/button";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { TOUR_STEPS } from "@/lib/app-tour";
import {
  intlLocale,
  createT,
  type Locale,
  type TFunction,
} from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n/en";
import { routePath } from "@/lib/i18n/routes";
import { getLatestRelease } from "@/lib/releases/store";
import type { AppRelease } from "@/lib/releases/types";
import { appDistribution, mobileAppReleases, mobileAppRepo } from "@/lib/site";
import { cn, siteUrl } from "@/lib/utils";

const APK_PATH = "/download/apk";

const formatDate = (iso: string, locale: Locale): string =>
  new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(iso));

const formatMb = (bytes: number): string => (bytes / 1024 / 1024).toFixed(1);

const Panel = ({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={cn(
      "flex flex-col rounded-card border border-ink-600 bg-ink-800 p-6",
      className,
    )}
  >
    <h2 className="font-mono text-xs font-semibold tracking-widest text-brand uppercase">
      {title}
    </h2>
    <div className="mt-4 flex-1">{children}</div>
  </section>
);

const STEP_KEYS: [TranslationKey, TranslationKey][] = [
  ["download.step1Title", "download.step1Body"],
  ["download.step2Title", "download.step2Body"],
  ["download.step3Title", "download.step3Body"],
];

const FAQ_KEYS: [TranslationKey, TranslationKey][] = [
  ["download.faq1Q", "download.faq1A"],
  ["download.faq2Q", "download.faq2A"],
  ["download.faq3Q", "download.faq3A"],
  ["download.faq4Q", "download.faq4A"],
];

const Requirements = ({
  t,
  release,
}: {
  t: TFunction;
  release: AppRelease | null;
}) => {
  const items: { icon: React.ComponentType<IconProps>; label: string }[] = [
    { icon: SmartphoneIcon, label: t("download.reqAndroid") },
    {
      icon: DownloadIcon,
      label: release
        ? t("download.reqSize", { size: formatMb(release.sizeBytes) })
        : t("download.reqSizeUnknown"),
    },
    { icon: WifiOffIcon, label: t("download.reqOffline") },
    { icon: RefreshIcon, label: t("download.reqOta") },
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-3 rounded-card border border-ink-600/70 bg-ink-850/60 px-4 py-3 text-sm text-ink-200"
        >
          <Icon size={18} className="shrink-0 text-brand" />
          {label}
        </li>
      ))}
    </ul>
  );
};

/**
 * Download page body — shared by /download (EN) and /es/descargar (ES).
 * In beta it links the newest release's versioned APK (or the GitHub releases
 * list when none is known — @see AGENTS.md#mobile-app-distribution) and
 * builds the whole page around that release: QR, notes, install steps,
 * checksum, requirements and FAQ. In development it shows the coming-soon
 * state with the same hero.
 */
export const DownloadView = async ({ locale }: { locale: Locale }) => {
  const t = createT(locale);
  const isDev = appDistribution.status === "development";
  const isBeta = appDistribution.status === "beta";
  const release = isBeta ? await getLatestRelease() : null;
  // Served from our origin with the APK media type (see app/download/apk):
  // phones finish and install; the versioned GitHub URL stays the checksum
  // reference.
  const apk = release ? APK_PATH : mobileAppReleases;
  const homeStep = TOUR_STEPS[0];

  return (
    <>
      <PageHero
        share
        eyebrow={isBeta ? t("download.betaBadge") : t("download.devBadge")}
        title={
          isBeta
            ? t("download.betaTitle")
            : isDev
              ? t("download.devTitle")
              : t("download.title")
        }
        subtitle={
          isBeta
            ? t("download.betaBody")
            : isDev
              ? t("download.devBody")
              : t("download.subtitle")
        }
        aside={
          <div className="relative">
            <div
              aria-hidden
              className="glow-brand absolute inset-x-0 -top-12 -z-10 h-80"
            />
            <DeviceFrame className="w-[15rem] sm:w-[16rem]">
              <TourScreen
                stepId={homeStep.id}
                image={homeStep.image}
                alt={t(homeStep.titleKey)}
              />
            </DeviceFrame>
          </div>
        }
      >
        {isBeta ? (
          <>
            <DownloadButtons
              apk={apk}
              releasesUrl={mobileAppReleases}
              version={release?.version}
            />
            {release && (
              <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ink-400">
                <span>
                  {t("download.version", { version: release.version })}
                </span>
                <span>
                  {t("download.releasedOn", {
                    date: formatDate(release.publishedAt, locale),
                  })}
                </span>
                <span>
                  {t("download.sizeMb", { size: formatMb(release.sizeBytes) })}
                </span>
              </p>
            )}
          </>
        ) : (
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
        )}
      </PageHero>

      <Container className="py-14 sm:py-16">
        {isBeta && (
          <>
            <Requirements t={t} release={release} />

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <Panel title={t("download.releaseTitle")}>
                {release ? (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-mono text-2xl font-bold text-ink-50">
                        v{release.version}
                      </span>
                      <span className="text-sm text-ink-400">
                        {formatDate(release.publishedAt, locale)}
                      </span>
                    </div>
                    <ReleaseNotes markdown={release.notes} />
                    <a
                      href={release.releaseUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                    >
                      {t("download.releaseNotes")}
                      <ArrowRightIcon size={15} />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-ink-400">
                    {t("download.noReleaseYet")}
                  </p>
                )}
              </Panel>

              <Panel title={t("download.installTitle")}>
                <ol className="space-y-4">
                  {STEP_KEYS.map(([titleKey, bodyKey], i) => (
                    <li key={titleKey} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand/40 bg-brand/10 font-mono text-xs font-semibold text-brand">
                        {i + 1}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink-50">
                          {t(titleKey)}
                        </span>
                        <span className="mt-0.5 block text-sm text-ink-300">
                          {t(bodyKey)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
                {release && (
                  <div className="mt-6 border-t border-ink-700 pt-5">
                    <ApkQr
                      url={`${siteUrl}${APK_PATH}`}
                      label={t("download.scan")}
                    />
                  </div>
                )}
              </Panel>

              <Panel title={t("download.verifyTitle")}>
                <p className="text-sm text-ink-300">
                  {t("download.verifyBody")}
                </p>
                {release ? (
                  <>
                    <div className="mt-4 flex items-start gap-2">
                      <code className="min-w-0 flex-1 rounded-field border border-ink-600 bg-ink-900 px-3 py-2 font-mono text-xs break-all text-ink-200 select-all">
                        {release.sha256}
                      </code>
                      <CopyButton
                        value={release.sha256}
                        label={t("download.copy")}
                        copiedLabel={t("calc.copied")}
                      />
                    </div>
                    <p className="mt-3 text-xs text-ink-400">
                      {t("download.checksumHint")}
                    </p>
                    <pre className="mt-3 overflow-x-auto rounded-field border border-ink-600/70 bg-ink-900 px-3 py-2 font-mono text-[11px] text-ink-400">
                      {`sha256sum metri-${release.version}.apk`}
                    </pre>
                  </>
                ) : null}
                <div className="mt-6 flex items-start gap-3 rounded-field border border-flame/30 bg-flame/[0.06] p-3">
                  <ShieldIcon
                    size={18}
                    className="mt-0.5 shrink-0 text-flame"
                  />
                  <div className="text-xs leading-relaxed text-ink-200">
                    <p className="font-semibold text-ink-50">
                      {t("download.disclaimerTitle")}
                    </p>
                    <p className="mt-1">{t("download.disclaimer")}</p>
                  </div>
                </div>
              </Panel>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <Panel title={t("download.modesTitle")}>
                <ul className="space-y-3">
                  {(
                    [
                      [SmartphoneIcon, "download.modeLocal"],
                      [CheckIcon, "download.modeFree"],
                      [CloudSyncIcon, "download.modePremium"],
                    ] as const
                  ).map(([Icon, key]) => (
                    <li
                      key={key}
                      className="flex items-start gap-3 text-sm text-ink-200"
                    >
                      <Icon size={16} className="mt-0.5 shrink-0 text-brand" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-3 rounded-field border border-ink-600/70 bg-ink-850 px-4 py-3 text-sm text-ink-300">
                  <AppleIcon size={18} className="shrink-0 text-ink-400" />
                  {t("download.iosNote")}
                </div>
              </Panel>

              <Panel title={t("download.faqTitle")}>
                <div className="divide-y divide-ink-700">
                  {FAQ_KEYS.map(([q, a]) => (
                    <details
                      key={q}
                      className="group py-3 first:pt-0 last:pb-0"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink-50 [&::-webkit-details-marker]:hidden">
                        {t(q)}
                        <ArrowRightIcon
                          size={16}
                          className="shrink-0 text-ink-400 transition-transform duration-300 group-open:rotate-90"
                        />
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-ink-300">
                        {t(a)}
                      </p>
                    </details>
                  ))}
                </div>
              </Panel>
            </div>
          </>
        )}
      </Container>
    </>
  );
};
