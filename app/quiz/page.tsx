import type { Metadata } from "next";

import { type QuizSearchParams, QuizView } from "@/components/quiz/QuizView";
import { quizMetadata } from "@/lib/quiz/metadata";

export const metadata: Metadata = quizMetadata("en");

const QuizPage = ({ searchParams }: { searchParams: QuizSearchParams }) => (
  <QuizView locale="en" searchParams={searchParams} />
);

export default QuizPage;
