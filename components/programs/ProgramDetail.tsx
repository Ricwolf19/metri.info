import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/shared/Container";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { CATEGORY_LABEL, MUSCLE_LABEL, getExercise } from "@/lib/exercises";
import { DIFFICULTY_LABEL } from "@/lib/exercises/data";
import { GOAL_LABEL, getProgram } from "@/lib/programs/data";
import type { TranslationKey } from "@/lib/i18n/en";
import { absoluteUrl } from "@/lib/utils";

export const ProgramDetail = async ({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) => {
  const program = getProgram(slug);
  if (!program) notFound();

  const t = createT(locale);
  const base = routePath("programs", locale);
  const exBase = routePath("exercises", locale);
  const catLabels = CATEGORY_LABEL as Record<string, TranslationKey>;

  const focusLabel = (id: string) =>
    MUSCLE_LABEL[id]
      ? t(MUSCLE_LABEL[id])
      : catLabels[id]
        ? t(catLabels[id])
        : id;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "METRI", url: routePath("home", locale) },
      { name: t("program.title"), url: base },
      { name: program.name[locale], url: `${base}/${slug}` },
    ].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-3xl">
        <nav className="flex items-center gap-2 text-sm text-ink-400">
          <Link href={base} className="hover:text-ink-200">
            {t("program.title")}
          </Link>
        </nav>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink-50">
          {program.name[locale]}
        </h1>
        <p className="mt-3 text-lg text-ink-300">
          {program.description[locale]}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {[
            t(GOAL_LABEL[program.goal]),
            t(DIFFICULTY_LABEL[program.difficulty]),
            t("program.weeks", { n: program.durationWeeks }),
            t("program.daysPerWeek", { n: program.daysPerWeek }),
          ].map((b) => (
            <span
              key={b}
              className="rounded-md bg-ink-700 px-2.5 py-1 text-xs text-ink-200"
            >
              {b}
            </span>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-bold text-ink-50">
          {t("program.exercisesTitle")}
        </h2>

        <div className="mt-5 space-y-5">
          {program.days.map((day, di) => (
            <div
              key={di}
              className="rounded-card border border-ink-600 bg-ink-800 p-5"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-ink-50">
                  {day.name[locale]}
                </h3>
                <span className="text-xs text-ink-400">
                  {day.focus.map(focusLabel).join(" · ")}
                </span>
              </div>
              <ul className="mt-4 divide-y divide-ink-700">
                {day.exercises.map((pe, ei) => {
                  const ex = getExercise(pe.slug);
                  return (
                    <li
                      key={ei}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      {ex ? (
                        <Link
                          href={`${exBase}/${ex.slug}`}
                          className="text-sm font-medium text-ink-100 hover:text-accent"
                        >
                          {ex.name[locale]}
                        </Link>
                      ) : (
                        <span className="text-sm text-ink-300">{pe.slug}</span>
                      )}
                      <span className="shrink-0 font-mono text-xs text-ink-400">
                        {pe.sets} × {pe.reps}
                        {pe.rir !== undefined ? ` · RIR ${pe.rir}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};
