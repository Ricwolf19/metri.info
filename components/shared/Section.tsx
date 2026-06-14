import { Container } from "@/components/shared/Container";
import { GradientText } from "@/components/shared/GradientText";
import { cn } from "@/lib/utils";

/** Vertically-padded page section. */
export const Section = ({
  className,
  children,
  id,
}: {
  className?: string;
  id?: string;
  children: React.ReactNode;
}) => (
  <section id={id} className={cn("py-20 sm:py-28", className)}>
    <Container>{children}</Container>
  </section>
);

/** Eyebrow + heading + optional subtitle, centered. */
export const SectionHeading = ({
  eyebrow,
  title,
  highlight,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  className?: string;
}) => (
  <div className={cn("mx-auto max-w-2xl text-center", className)}>
    {eyebrow && (
      <p className="text-sm font-semibold tracking-wide text-accent uppercase">
        {eyebrow}
      </p>
    )}
    <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance text-ink-50 sm:text-4xl">
      {title} {highlight && <GradientText>{highlight}</GradientText>}
    </h2>
    {subtitle && (
      <p className="mx-auto mt-4 max-w-xl text-pretty text-ink-300">
        {subtitle}
      </p>
    )}
  </div>
);
