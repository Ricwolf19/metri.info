import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";

/**
 * A page with little to say (not found, offline, unsubscribed): its content
 * in the middle of the first screen under the header, so it reads as a
 * deliberate page and not one that failed to fill. The footer stays below
 * the fold.
 */
export const CenteredScreen = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <Container
    className={cn(
      "flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center py-14",
      className,
    )}
  >
    {children}
  </Container>
);
