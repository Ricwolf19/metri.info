import type { Metadata } from "next";

import { type QuizSearchParams, QuizView } from "@/components/quiz/QuizView";
import { quizResultMetadata } from "@/lib/quiz/metadata";

/** A shared knowledge map (`?r=`). The quiz itself stays one click away. */
export const generateMetadata = ({
  searchParams,
}: {
  searchParams: QuizSearchParams;
}): Promise<Metadata> => quizResultMetadata("es", searchParams);

const ResultadoPage = ({
  searchParams,
}: {
  searchParams: QuizSearchParams;
}) => <QuizView locale="es" searchParams={searchParams} />;

export default ResultadoPage;
