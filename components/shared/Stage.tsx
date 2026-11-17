import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";

/**
 * The working area under a page hero for a flow whose height changes as it
 * goes (the roadmap's questions, the quiz, a form that turns into a thank-you
 * note). It reserves a full screen of height, so a step that gets shorter
 * never pulls the footer up into view: wherever the flow sits under the
 * header (focus moves scroll it a little past it), the footer stays below
 * the fold and the page under the reader holds still.
 */
export const Stage = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <Container className={cn("min-h-svh", className)}>{children}</Container>;
