"use client";

import Link from "next/link";

import {
  ArrowRightIcon,
  CheckIcon,
  CodeIcon,
  DumbbellIcon,
  FlameIcon,
  TrendingUpIcon,
  WifiOffIcon,
  ZapIcon,
  type IconProps,
} from "@/components/icons";
import { AnimatedItem } from "@/components/shared/AnimatedSection";
import { Container } from "@/components/shared/Container";
import { GradientText } from "@/components/shared/GradientText";
import { Parallax } from "@/components/shared/Parallax";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

const FEATURES: {
  icon: React.ComponentType<IconProps>;
  key: TranslationKey;
}[] = [
  { icon: ZapIcon, key: "showcase.feature1" },
  { icon: WifiOffIcon, key: "showcase.feature2" },
  { icon: TrendingUpIcon, key: "showcase.feature3" },
  { icon: CodeIcon, key: "showcase.feature4" },
];

/** App preview — on-brand mock of the mobile app: training (routines, rest timer,
 * logged sets), progress over time, macros and reminders. Parallaxes on scroll. */
const EXERCISES = [
  { name: "Bench Press", sets: "4 × 8", load: "80 kg", done: true },
  { name: "Overhead Press", sets: "3 × 10", load: "45 kg", done: false },
];
const SPARKLINE = [38, 52, 44, 66, 58, 82, 100];

const PreviewTiles = () => (
  <div className="relative">
    <div
      aria-hidden
      className="glow-brand pointer-events-none absolute inset-0 -z-10"
    />
    <div className="space-y-3 rounded-card border border-ink-600 bg-ink-900/70 p-4 shadow-2xl backdrop-blur">
      <div className="rounded-field border border-ink-600/70 bg-ink-800 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-field border border-brand/30 bg-brand/10 text-brand">
              <DumbbellIcon size={15} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-50">Push Day</p>
              <p className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">
                Week 3 · 5 exercises
              </p>
            </div>
          </div>
          <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 font-mono text-xs text-brand">
            02:00
          </span>
        </div>
        <div className="mt-3 space-y-1.5">
          {EXERCISES.map((ex) => (
            <div
              key={ex.name}
              className="flex items-center justify-between text-xs"
            >
              <span className="flex items-center gap-2 text-ink-200">
                {ex.done ? (
                  <CheckIcon size={13} className="text-brand" />
                ) : (
                  <span className="h-3 w-3 rounded-full border border-ink-500" />
                )}
                {ex.name}
              </span>
              <span className="font-mono text-ink-400">
                {ex.sets} · {ex.load}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-field border border-ink-600/70 bg-ink-800 p-3">
          <p className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">
            Bench 1RM
          </p>
          <div className="mt-2 flex h-9 items-end gap-1">
            {SPARKLINE.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm bg-brand"
                style={{
                  height: `${h}%`,
                  opacity: 0.35 + (i / SPARKLINE.length) * 0.65,
                }}
              />
            ))}
          </div>
          <p className="mt-1.5 flex items-center gap-1 font-mono text-xs text-brand">
            <TrendingUpIcon size={12} />
            +8 kg
          </p>
        </div>
        <div className="rounded-field border border-ink-600/70 bg-ink-800 p-3">
          <p className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">
            Protein
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-ink-50">
            180
            <span className="ml-1 text-xs text-ink-400">/ 190 g</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700">
            <div className="h-full w-[95%] rounded-full bg-brand" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-field border border-ink-600/70 bg-ink-800 px-3 py-2">
        <FlameIcon size={14} className="shrink-0 text-brand" />
        <span className="text-xs text-ink-300">
          Leg day tomorrow ·{" "}
          <span className="text-ink-100">7:00 AM reminder</span>
        </span>
      </div>
    </div>
  </div>
);

export const AppShowcase = () => {
  const { t, locale } = useI18n();

  return (
    <section className="border-y border-ink-600/40 bg-ink-850 py-16 sm:py-24">
      <Container className="grid items-center gap-16 lg:grid-cols-2">
        <AnimatedItem>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 font-mono text-xs font-medium tracking-wide text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {t("showcase.badge")}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-ink-50 sm:text-4xl">
            {t("showcase.title")}{" "}
            <GradientText>{t("showcase.highlight")}</GradientText>
          </h2>
          <p className="mt-4 max-w-md text-ink-300">{t("showcase.subtitle")}</p>

          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-700 text-accent">
                  <Icon size={16} />
                </span>
                <span className="text-sm text-ink-200">{t(key)}</span>
              </li>
            ))}
          </ul>

          <Link
            href={routePath("download", locale)}
            className={cn(buttonVariants({ variant: "secondary" }), "mt-8")}
          >
            {t("showcase.cta")}
            <ArrowRightIcon size={16} />
          </Link>
        </AnimatedItem>

        <AnimatedItem delay={0.08}>
          <Parallax offset={28} className="lg:px-6">
            <PreviewTiles />
          </Parallax>
        </AnimatedItem>
      </Container>
    </section>
  );
};
