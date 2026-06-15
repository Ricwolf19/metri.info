import Link from "next/link";

import { CALC_ICONS } from "@/components/calculators/calcIcons";
import { GlowCard } from "@/components/shared/GlowCard";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/Section";
import { createT, type Locale } from "@/lib/i18n/config";
import { CALC_IDS, routePath } from "@/lib/i18n/routes";
import { CALC_CONTENT } from "@/lib/calculators/content";

export const ToolsIndex = ({ locale }: { locale: Locale }) => {
  const t = createT(locale);

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow={t("nav.tools")}
        title={t("tools.title")}
        subtitle={t("tools.subtitle")}
        className="mb-12"
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CALC_IDS.map((id) => {
          const Icon = CALC_ICONS[id];
          const c = CALC_CONTENT[id][locale];
          return (
            <Link
              key={id}
              href={routePath(id, locale)}
              className="block h-full"
            >
              <GlowCard className="flex h-full flex-col">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-700 text-accent">
                  <Icon size={22} />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-ink-50">
                  {c.h1}
                </h2>
                <p className="mt-2 text-sm text-ink-300">{c.tagline}</p>
              </GlowCard>
            </Link>
          );
        })}
      </div>
    </Container>
  );
};
