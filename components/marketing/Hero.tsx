"use client";

import Link from "next/link";

import { ArrowRightIcon, DownloadIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

/**
 * Above-the-fold hero. Intentionally NOT Framer-animated: the content must be
 * present and visible in the server HTML for fast FCP/LCP on mobile. The subtle
 * entrance is a pure-CSS `animate-rise` (see globals.css) that paints on the
 * first frame and never depends on hydration.
 */
export const Hero = () => {
  const { t, locale } = useI18n();

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-10rem] left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-ink-700 blur-[120px]"
      />
      <Container className="relative py-24 text-center sm:py-32">
        <div className="mx-auto max-w-3xl">
          <span className="animate-rise inline-flex items-center rounded-full border border-ink-600 bg-ink-700 px-3 py-1 text-xs font-medium text-accent">
            {t("hero.badge")}
          </span>

          <h1
            className="animate-rise mt-6 text-5xl font-bold tracking-tight text-balance text-ink-50 sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            {t("hero.title")}
          </h1>

          <p
            className="animate-rise mx-auto mt-6 max-w-2xl text-lg text-pretty text-ink-300"
            style={{ animationDelay: "120ms" }}
          >
            {t("hero.subtitle")}
          </p>

          <div
            className="animate-rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
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
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <DownloadIcon size={18} />
              {t("hero.ctaDownload")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};
