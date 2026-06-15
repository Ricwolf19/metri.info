import Link from "next/link";

import { GlowCard } from "@/components/shared/GlowCard";
import { Container } from "@/components/shared/Container";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { DIFFICULTY_LABEL } from "@/lib/exercises/data";
import { GOAL_LABEL, getAllPrograms } from "@/lib/programs/data";

export const ProgramsIndex = ({ locale }: { locale: Locale }) => {
  const t = createT(locale);
  const base = routePath("programs", locale);

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink-50 sm:text-5xl">
          {t("program.title")}
        </h1>
        <p className="mt-4 text-lg text-ink-300">{t("program.subtitle")}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {getAllPrograms().map((p) => (
          <Link
            key={p.slug}
            href={`${base}/${p.slug}`}
            className="block h-full"
          >
            <GlowCard className="flex h-full flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-ink-50">
                  {p.name[locale]}
                </h2>
                {p.featured && (
                  <span className="rounded-md border border-ink-600 bg-ink-700 px-2 py-0.5 text-xs text-accent">
                    {t("program.featured")}
                  </span>
                )}
              </div>
              <p className="mt-2 flex-1 text-sm text-ink-300">
                {p.description[locale]}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {[
                  t(GOAL_LABEL[p.goal]),
                  t(DIFFICULTY_LABEL[p.difficulty]),
                  t("program.weeks", { n: p.durationWeeks }),
                  t("program.daysPerWeek", { n: p.daysPerWeek }),
                ].map((b) => (
                  <span
                    key={b}
                    className="rounded-md bg-ink-700 px-2 py-0.5 text-xs text-ink-200"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </GlowCard>
          </Link>
        ))}
      </div>
    </Container>
  );
};
