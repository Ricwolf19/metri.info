"use client";

import { GithubIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { GradientText } from "@/components/shared/GradientText";
import { useT } from "@/lib/i18n";
import { webAppRepo } from "@/lib/site";

export const OpenSourceCTA = () => {
  const t = useT();

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-card border border-ink-600 bg-ink-800 px-8 py-16 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-ink-700 blur-[100px]"
          />
          <h2 className="relative text-3xl font-bold tracking-tight text-balance text-ink-50 sm:text-4xl">
            {t("oss.title").replace(/\.$/, "")}{" "}
            <GradientText>Metri</GradientText>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-ink-300">
            {t("oss.subtitle")}
          </p>
          <a
            href={webAppRepo}
            target="_blank"
            rel="noreferrer noopener"
            className="relative mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-ink-50 px-6 font-semibold text-ink-900 transition-transform hover:scale-[1.02]"
          >
            <GithubIcon size={18} />
            {t("oss.cta")}
          </a>
        </div>
      </Container>
    </section>
  );
};
