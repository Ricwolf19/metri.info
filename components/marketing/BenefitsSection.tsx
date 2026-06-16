"use client";

import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { BenefitsPanel } from "@/components/marketing/BenefitsPanel";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Section, SectionHeading } from "@/components/shared/Section";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";

/** Account-benefits section — the Neon-style value panel plus a sign-up CTA.
 * Not billing: communicates why a free account is worth it (history, favorites,
 * linked logins, future mobile sync). */
export const BenefitsSection = () => {
  const { t, locale } = useI18n();

  return (
    <Section>
      <SectionHeading
        eyebrow={t("benefits.eyebrow")}
        title={t("benefits.title")}
        subtitle={t("benefits.subtitle")}
      />

      <AnimatedSection className="mt-12">
        <BenefitsPanel />
      </AnimatedSection>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={routePath("signUp", locale)}
          className={buttonVariants({ size: "lg" })}
        >
          {t("benefits.ctaCreate")}
          <ArrowRightIcon size={18} />
        </Link>
        <Link
          href={routePath("signIn", locale)}
          className={buttonVariants({ variant: "secondary", size: "lg" })}
        >
          {t("benefits.ctaSignIn")}
        </Link>
      </div>
    </Section>
  );
};
