import type { Metadata } from "next";

import { type QuizSearchParams, QuizView } from "@/components/quiz/QuizView";
import { quizResultMetadata } from "@/lib/quiz/metadata";

/** A shared knowledge map (`?r=`). The quiz itself stays one click away. */
export const generateMetadata = ({
  searchParams,
}: {
  searchParams: QuizSearchParams;
}): Promise<Metadata> => quizResultMetadata("en", searchParams);

const QuizResultPage = ({
  searchParams,
}: {
  searchParams: QuizSearchParams;
}) => <QuizView locale="en" searchParams={searchParams} />;

export default QuizResultPage;
