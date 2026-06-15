import type { Metadata } from "next";

import { ExerciseDetail } from "@/components/exercises/ExerciseDetail";
import { getExercise, getExerciseSlugs } from "@/lib/exercises";

export const generateStaticParams = () =>
  getExerciseSlugs().map((slug) => ({ slug }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const ex = getExercise(slug);
  if (!ex) return {};
  return {
    title: `${ex.name.es} — Técnica y músculos`,
    description: ex.instructions.es[0],
    alternates: {
      canonical: `/es/ejercicios/${slug}`,
      languages: {
        en: `/exercises/${slug}`,
        es: `/es/ejercicios/${slug}`,
        "x-default": `/exercises/${slug}`,
      },
    },
  };
};

const EjercicioPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return <ExerciseDetail locale="es" slug={slug} />;
};

export default EjercicioPage;
