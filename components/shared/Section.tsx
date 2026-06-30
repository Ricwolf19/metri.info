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
  <section id={id} className={cn("py-16 sm:py-24", className)}>
    <Container>{children}</Container>
  </section>
);

/**
 * Page-level header (renders an `h1`) — eyebrow + title + optional subtitle.
 * `align="center"` (default) suits index pages; `align="left"` suits split
 * layouts. Extra nodes (badges, CTAs) can be passed as children.
 */
export const PageHeader = ({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "center",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
  children?: React.ReactNode;
}) => (
  <div
    className={cn(
      align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
      className,
    )}
  >
    {eyebrow && (
      <p className="font-mono text-xs font-medium tracking-widest text-brand uppercase">
        {eyebrow}
      </p>
    )}
    <h1
      className={cn(
        "text-4xl font-bold tracking-tight text-balance text-ink-50 sm:text-5xl",
        eyebrow && "mt-3",
      )}
    >
      {title} {highlight && <GradientText>{highlight}</GradientText>}
    </h1>
    {subtitle && (
      <p
        className={cn(
          "mt-5 text-lg text-pretty text-ink-300",
          align === "center" && "mx-auto max-w-xl",
        )}
      >
        {subtitle}
      </p>
    )}
    {children}
  </div>
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
      <p className="font-mono text-xs font-medium tracking-widest text-brand uppercase">
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
