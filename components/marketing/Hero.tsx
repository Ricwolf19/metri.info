"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { ArrowRightIcon, DownloadIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { buttonVariants } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

export const Hero = () => {
  const { t, locale } = useI18n();

  return (
    <section className="relative overflow-hidden">
      {/* Ambient lime glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-10rem] left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-ink-700 blur-[120px]"
      />
      <Container className="relative py-24 text-center sm:py-32">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center rounded-full border border-ink-600 bg-ink-700 px-3 py-1 text-xs font-medium text-accent"
          >
            {t("hero.badge")}
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            className="mt-6 text-5xl font-bold tracking-tight text-balance text-ink-50 sm:text-6xl"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-ink-300"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
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
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};
