import {
  ExerciseGrid,
  type ExerciseCard,
} from "@/components/exercises/ExerciseGrid";
import { Container } from "@/components/shared/Container";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { getAllExercises } from "@/lib/exercises";

export const ExercisesIndex = ({ locale }: { locale: Locale }) => {
  const t = createT(locale);
  const items: ExerciseCard[] = getAllExercises().map((e) => ({
    slug: e.slug,
    name: e.name[locale],
    category: e.category,
    equipment: e.equipment,
    difficulty: e.difficulty,
  }));

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink-50 sm:text-5xl">
          {t("ex.title")}
        </h1>
        <p className="mt-4 text-lg text-ink-300">{t("ex.subtitle")}</p>
      </div>
      <ExerciseGrid items={items} basePath={routePath("exercises", locale)} />
    </Container>
  );
};
