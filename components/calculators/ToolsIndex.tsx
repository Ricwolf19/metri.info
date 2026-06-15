import Link from "next/link";

import {
  ActivityIcon,
  AppleIcon,
  CalculatorIcon,
  DropletsIcon,
  DumbbellIcon,
  FlameIcon,
  RulerIcon,
  ScaleIcon,
  type IconProps,
} from "@/components/icons";
import { GlowCard } from "@/components/shared/GlowCard";
import { Container } from "@/components/shared/Container";
import { createT, type Locale } from "@/lib/i18n/config";
import { CALC_IDS, routePath, type CalcRouteId } from "@/lib/i18n/routes";
import { CALC_CONTENT } from "@/lib/calculators/content";

const ICONS: Record<CalcRouteId, React.ComponentType<IconProps>> = {
  onerm: DumbbellIcon,
  tdee: FlameIcon,
  macros: AppleIcon,
  bodyfat: ScaleIcon,
  bmi: RulerIcon,
  ffmi: ActivityIcon,
  water: DropletsIcon,
  plates: CalculatorIcon,
};

export const ToolsIndex = ({ locale }: { locale: Locale }) => {
  const t = createT(locale);

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink-50 sm:text-5xl">
          {t("tools.title")}
        </h1>
        <p className="mt-4 text-lg text-ink-300">{t("tools.subtitle")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CALC_IDS.map((id) => {
          const Icon = ICONS[id];
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
