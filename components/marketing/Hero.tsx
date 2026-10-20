"use client";

import Link from "next/link";

import { ArrowRightIcon, DownloadIcon, MedalIcon } from "@/components/icons";
import { HeroField } from "@/components/marketing/HeroField";
import { Container } from "@/components/shared/Container";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { CALC_IDS, routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

const STATS: { value: string; key: TranslationKey }[] = [
  { value: String(CALC_IDS.length), key: "stats.calculators" },
  { value: "20+", key: "stats.guides" },
  { value: "0", key: "stats.account" },
  { value: "MIT", key: "stats.license" },
];

/** "Track. Progress. Evolve." — the middle beat gets the brand colour. Falls
 * back to the plain string when a locale doesn't come in three beats. */
const Headline = ({ title }: { title: string }) => {
  const words = title.split(" ");
  if (words.length !== 3) return <>{title}</>;
  return (
    <>
      {words[0]} <span className="text-brand italic">{words[1]}</span>{" "}
      {words[2]}
    </>
  );
};

/**
 * Viewport-bound hero (`min-h-[100svh]` + flex centering) so the kicker,
 * headline, CTAs and trust stats all land in the first screen.
 *
 * Entrance is pure-CSS `animate-rise` from globals.css, so the copy is in the
 * server HTML and paints before hydration. `<HeroField />` is the only script
 * here and it is decorative: it fades in behind the copy once it has drawn.
 */
export const Hero = () => {
  const { t, locale } = useI18n();
  const kicker = t("hero.kicker").split("·");

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink-900">
      <HeroField />
      <div
        aria-hidden
        className="glow-orb pointer-events-none absolute top-[-30%] left-1/2 -z-10 h-[90vh] w-[140vw] max-w-[100rem] -translate-x-1/2 opacity-60"
      />

      <Container className="relative z-10 py-24 text-center sm:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="animate-rise flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[11px] font-medium tracking-[0.18em] text-brand uppercase sm:text-xs">
            {kicker.map((part, i) => (
              <span key={part} className="flex items-center gap-3">
                {i > 0 && (
                  <span
                    aria-hidden
                    className="h-1 w-1 rounded-full bg-brand/70"
                  />
                )}
                {part.trim()}
              </span>
            ))}
          </p>

          <h1
            className="animate-rise mt-6 text-5xl font-bold tracking-tight text-balance text-ink-50 sm:text-7xl"
            style={{ animationDelay: "60ms" }}
          >
            <Headline title={t("hero.title")} />
          </h1>

          <p
            className="animate-rise mx-auto mt-6 max-w-2xl text-base text-pretty text-ink-300 sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            {t("hero.subtitle")}
          </p>

          <div
            className="animate-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href={routePath("download", locale)}
              className={cn(
                buttonVariants({ variant: "brand", size: "lg" }),
                "transition-transform hover:scale-[1.02]",
              )}
            >
              <DownloadIcon size={18} />
              {t("hero.ctaDownload")}
            </Link>
            <Link
              href={routePath("quiz", locale)}
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              <MedalIcon size={18} />
              {t("quiz.heroCta")}
            </Link>
            <Link
              href={routePath("tools", locale)}
              className={buttonVariants({ variant: "outline", size: "md" })}
            >
              {t("hero.ctaTools")}
              <ArrowRightIcon size={18} />
            </Link>
          </div>

          {/* A grid, not a wrapping row: four chips in a flex row broke
              three-plus-one on tablets and one-per-line on phones. */}
          <dl
            className="animate-rise mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-2.5"
            style={{ animationDelay: "240ms" }}
          >
            {STATS.map(({ value, key }) => (
              <div
                key={key}
                className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5"
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                />
                <dt className="font-mono text-sm font-semibold text-ink-50">
                  {value}
                </dt>
                <dd className="truncate font-mono text-[11px] tracking-wide text-ink-400 uppercase">
                  {t(key)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
};
