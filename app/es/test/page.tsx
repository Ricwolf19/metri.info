import type { Metadata } from "next";

import { type QuizSearchParams, QuizView } from "@/components/quiz/QuizView";
import { quizMetadata } from "@/lib/quiz/metadata";

export const metadata: Metadata = quizMetadata("es");

const TestPage = ({ searchParams }: { searchParams: QuizSearchParams }) => (
  <QuizView locale="es" searchParams={searchParams} />
);

export default TestPage;
