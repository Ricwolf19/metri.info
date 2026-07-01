"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { ArrowRightIcon, DownloadIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

// Lazy Three.js beams — keeps ~150KB gz out of the critical path; `ssr: false` because there's no GPU/canvas on the server.
const Beams = dynamic(
  () => import("@/components/background/Beams").then((m) => m.Beams),
  { ssr: false },
);

const STATS: { value: string; key: TranslationKey }[] = [
  { value: "16", key: "stats.calculators" },
  { value: "20+", key: "stats.guides" },
  { value: "0", key: "stats.account" },
  { value: "MIT", key: "stats.license" },
];

/**
 * Viewport-bound hero (`min-h-[100svh]` + flex centering) so the headline,
 * CTAs and trust stats all land in the first screen.
 *
 * Background layers are decorative and `pointer-events-none`:
 *   1. `<Beams />` — WebGL light beams (Three.js).
 *   2. Soft `glow-brand` lime aura (legacy, dimmed).
 *
 * Entrance is pure-CSS `animate-rise` from globals.css — no Framer Motion,
 * so the content is present in server HTML for fast FCP/LCP.
 */
export const Hero = () => {
  const { t, locale } = useI18n();

  return (
    <section className="hero-dark-treat relative isolate flex min-h-[100svh] items-center overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>
      <div
        aria-hidden
        className="glow-brand pointer-events-none absolute inset-x-0 top-[-6rem] h-[34rem] opacity-40"
      />

      <Container className="relative z-10 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-3xl">
          <span className="hero-badge animate-rise inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-medium tracking-wide backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {t("hero.badge")}
          </span>

          <h1
            className="animate-rise mt-6 text-5xl font-bold tracking-tight text-balance text-ink-50 sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            {t("hero.title")}
          </h1>

          <p
            className="animate-rise mx-auto mt-5 max-w-2xl text-base text-pretty text-ink-300 sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            {t("hero.subtitle")}
          </p>

          <div
            className="animate-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href={routePath("tools", locale)}
              className={cn(
                buttonVariants({ size: "lg" }),
                "transition-transform hover:scale-[1.02]",
              )}
            >
              {t("hero.ctaTools")}
              <ArrowRightIcon size={18} />
            </Link>
            <Link
              href={routePath("download", locale)}
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "hero-btn-secondary",
              )}
            >
              <DownloadIcon size={18} />
              {t("hero.ctaDownload")}
            </Link>
          </div>

          <dl
            className="animate-rise mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-2.5"
            style={{ animationDelay: "240ms" }}
          >
            {STATS.map(({ value, key }) => (
              <div
                key={key}
                className="hero-stat-pill inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5"
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                />
                <dt className="font-mono text-sm font-semibold text-ink-50">
                  {value}
                </dt>
                <dd className="font-mono text-[11px] tracking-wide text-ink-400 uppercase">
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
