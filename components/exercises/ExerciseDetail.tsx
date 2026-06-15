import Link from "next/link";
import { notFound } from "next/navigation";

import { MuscleBadge } from "@/components/docs/MuscleBadge";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/shared/Container";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import {
  CATEGORY_LABEL,
  DIFFICULTY_LABEL,
  EQUIPMENT_LABEL,
  MUSCLE_LABEL,
  getExercise,
} from "@/lib/exercises";
import { absoluteUrl } from "@/lib/utils";

export const ExerciseDetail = async ({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) => {
  const ex = getExercise(slug);
  if (!ex) notFound();

  const t = createT(locale);
  const base = routePath("exercises", locale);
  const muscles = (ids: string[]) =>
    ids.map((id) => (MUSCLE_LABEL[id] ? t(MUSCLE_LABEL[id]) : id));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: ex.name[locale],
      inLanguage: locale,
      step: ex.instructions[locale].map((text, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        text,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "METRI", url: routePath("home", locale) },
        { name: t("ex.title"), url: base },
        { name: ex.name[locale], url: `${base}/${slug}` },
      ].map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: absoluteUrl(item.url),
      })),
    },
  ];

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-2xl">
        <nav className="flex items-center gap-2 text-sm text-ink-400">
          <Link href={base} className="hover:text-ink-200">
            {t("ex.title")}
          </Link>
          <span>/</span>
          <span className="text-ink-300">{t(CATEGORY_LABEL[ex.category])}</span>
        </nav>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink-50">
          {ex.name[locale]}
        </h1>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-md bg-ink-700 px-2.5 py-1 text-xs text-ink-200">
            {t("ex.equipmentLabel")}: {t(EQUIPMENT_LABEL[ex.equipment])}
          </span>
          <span className="rounded-md border border-lime-400/25 bg-lime-400/10 px-2.5 py-1 text-xs text-accent">
            {t(DIFFICULTY_LABEL[ex.difficulty])}
          </span>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-ink-400 uppercase">
              {t("ex.primaryMuscles")}
            </h2>
            <div className="mt-3 flex flex-wrap">
              {muscles(ex.primaryMuscles).map((m) => (
                <MuscleBadge key={m}>{m}</MuscleBadge>
              ))}
            </div>
          </div>
          {ex.secondaryMuscles.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-ink-400 uppercase">
                {t("ex.secondaryMuscles")}
              </h2>
              <div className="mt-3 flex flex-wrap gap-1">
                {muscles(ex.secondaryMuscles).map((m) => (
                  <span
                    key={m}
                    className="mr-1 rounded-md border border-ink-600 bg-ink-800 px-2 py-0.5 text-xs text-ink-300"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-ink-50">
            {t("ex.instructions")}
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-6 text-ink-200">
            {ex.instructions[locale].map((step, i) => (
              <li key={i} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Container>
  );
};
