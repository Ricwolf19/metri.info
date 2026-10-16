"use client";

import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";

import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { TourScreen } from "@/components/marketing/tour/TourScreen";
import { Reveal } from "@/components/motion/Reveal";
import { Section, SectionHeading } from "@/components/shared/Section";
import { buttonVariants } from "@/components/ui/button";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { Segmented } from "@/components/ui/segmented";
import { TOUR_STEPS, type TourStepId } from "@/lib/app-tour";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { appDistribution } from "@/lib/site";
import { cn } from "@/lib/utils";

const SCREEN_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Guided tour of the mobile app, tab by tab. Desktop: the phone stays pinned
 * while the five steps scroll past and each one swaps the screen as it enters
 * the middle of the viewport. Below `lg` the same steps become a segmented
 * tab control above a single phone, since there is no room to pin anything.
 */
export const AppTour = () => {
  const { t, locale } = useI18n();
  const [active, setActive] = useState<TourStepId>("home");
  const step = TOUR_STEPS.find((s) => s.id === active) ?? TOUR_STEPS[0];
  const tabOptions = TOUR_STEPS.map((s) => ({
    value: s.id,
    label: t(s.tabKey),
  }));

  const phone = (
    <DeviceFrame className="w-[17rem] sm:w-[18rem] xl:w-[20rem]">
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={step.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: 0.28, ease: SCREEN_EASE }}
        >
          <TourScreen
            stepId={step.id}
            image={step.image}
            alt={t(step.titleKey)}
          />
        </m.div>
      </AnimatePresence>
    </DeviceFrame>
  );

  return (
    <Section id="app" className="border-y border-ink-600/40 bg-ink-850">
      <SectionHeading
        eyebrow={
          appDistribution.status === "beta"
            ? t("tour.eyebrowBeta")
            : t("tour.eyebrow")
        }
        title={t("tour.title")}
        highlight={t("tour.highlight")}
        subtitle={t("tour.subtitle")}
      />

      {/* Mobile and tablet: tabs + one phone + the active step's copy. */}
      <div className="mt-10 lg:hidden">
        <Segmented
          size="sm"
          value={active}
          onValueChange={setActive}
          options={tabOptions}
          aria-label={t("tour.tabsAria")}
          className="mx-auto max-w-xl"
        />
        <div className="relative isolate mx-auto mt-8 max-w-sm">
          <div
            aria-hidden
            className="glow-orb pointer-events-none absolute -inset-x-20 -inset-y-12 -z-10"
          />
          {phone}
        </div>
        <div className="mx-auto mt-8 max-w-md text-center">
          <h3 className="text-xl font-bold text-ink-50">{t(step.titleKey)}</h3>
          <p className="mt-2 text-pretty text-ink-300">{t(step.bodyKey)}</p>
        </div>
      </div>

      {/* Desktop: pinned phone, scrolling steps. */}
      <div className="mt-16 hidden gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-20">
        <div className="relative">
          <div
            className="sticky isolate flex flex-col items-center [--phone-h:39rem] xl:[--phone-h:43.4rem]"
            style={{
              top: "max(5.5rem, calc((100vh - var(--phone-h) - 2.5rem) / 2))",
            }}
          >
            {/* Oversized orb, centred on the phone, so the glow fades out on
                every side instead of ending on the edge of a box. */}
            <div
              aria-hidden
              className="glow-orb pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[150%] w-[200%] -translate-x-1/2 -translate-y-1/2"
            />
            {phone}
            <ol className="mt-6 flex justify-center gap-2" aria-hidden>
              {TOUR_STEPS.map((s) => (
                <li
                  key={s.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    s.id === active ? "w-8 bg-brand" : "w-1.5 bg-ink-600",
                  )}
                />
              ))}
            </ol>
          </div>
        </div>

        <ol className="space-y-6">
          {TOUR_STEPS.map((s, i) => {
            const Icon = s.icon;
            const current = s.id === active;
            return (
              <m.li
                key={s.id}
                onViewportEnter={() => setActive(s.id)}
                viewport={{ margin: "-45% 0px -45% 0px" }}
                className={cn(
                  "min-h-[60vh] scroll-mt-28 rounded-card border p-8 transition-colors duration-300",
                  current
                    ? "border-brand/30 bg-ink-800"
                    : "border-ink-600/50 bg-ink-800/40",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-field border transition-colors",
                      current
                        ? "border-brand/40 bg-brand/10 text-brand"
                        : "border-ink-600 bg-ink-700 text-ink-300",
                    )}
                  >
                    <Icon size={22} />
                  </span>
                  <span className="font-mono text-xs tracking-widest text-ink-500 uppercase">
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {String(TOUR_STEPS.length).padStart(2, "0")}
                    <span className="mx-2 text-ink-600">·</span>
                    {t(s.tabKey)}
                  </span>
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-tight text-ink-50">
                  {t(s.titleKey)}
                </h3>
                <p className="mt-3 text-pretty text-ink-300">{t(s.bodyKey)}</p>
                <ul className="mt-6 space-y-2.5">
                  {s.pointKeys.map((k) => (
                    <li
                      key={k}
                      className="flex items-start gap-2.5 text-sm text-ink-200"
                    >
                      <CheckIcon
                        size={16}
                        className="mt-0.5 shrink-0 text-brand"
                      />
                      {t(k)}
                    </li>
                  ))}
                </ul>
              </m.li>
            );
          })}
        </ol>
      </div>

      <Reveal className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={routePath("download", locale)}
          className={buttonVariants({ variant: "brand", size: "lg" })}
        >
          {t("tour.ctaDownload")}
          <ArrowRightIcon size={18} />
        </Link>
        <p className="text-sm text-ink-400">{t("tour.ctaNote")}</p>
      </Reveal>
    </Section>
  );
};
