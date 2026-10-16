import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/Section";
import { cn } from "@/lib/utils";

/**
 * The standard opening band for a section page (tools, docs, download,
 * contact, account): a faint plot grid and brand glow behind a `PageHeader`,
 * with an optional `aside` column for a visual. Every section starting the
 * same way is what makes the site read as one product.
 */
export const PageHero = ({
  eyebrow,
  title,
  highlight,
  subtitle,
  align,
  aside,
  children,
  className,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "center" | "left";
  aside?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) => {
  const alignment = align ?? (aside ? "left" : "center");
  return (
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
        {aside ? (
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <PageHeader
              eyebrow={eyebrow}
              title={title}
              highlight={highlight}
              subtitle={subtitle}
              align={alignment}
            >
              {children}
            </PageHeader>
            <div className="min-w-0">{aside}</div>
          </div>
        ) : (
          <PageHeader
            eyebrow={eyebrow}
            title={title}
            highlight={highlight}
            subtitle={subtitle}
            align={alignment}
          >
            {children}
          </PageHeader>
        )}
      </Container>
    </section>
  );
};
