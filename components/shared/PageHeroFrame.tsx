import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";

/**
 * The band a section page opens with: a faint plot grid and a brand glow
 * behind the content, a rule under it. `PageHero` fills it with the page's
 * header; `HeroSkeleton` with placeholders of the same size, so a loading
 * page and the page it turns into start at the same height.
 */
export const PageHeroFrame = ({
  compact = false,
  className,
  children,
}: {
  compact?: boolean;
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={cn(
      "relative isolate overflow-hidden border-b border-ink-600/40",
      className,
    )}
  >
    <div
      aria-hidden
      className="page-grid pointer-events-none absolute inset-0 -z-10"
    />
    <div
      aria-hidden
      className="glow-brand pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 opacity-70"
    />
    <Container className={compact ? "py-10 sm:py-14" : "py-14 sm:py-20"}>
      {children}
    </Container>
  </section>
);
