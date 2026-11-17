import { PageHeroFrame } from "@/components/shared/PageHeroFrame";
import { PageHeader } from "@/components/shared/Section";
import { ShareButton } from "@/components/shared/ShareButton";

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
  share = false,
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
  /** Show a share / copy-link chip under the header. */
  share?: boolean;
}) => {
  const alignment = align ?? (aside ? "left" : "center");
  return (
    <PageHeroFrame compact={compact} className={className}>
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
            {share && <ShareButton className="mt-6" />}
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
          {share && <ShareButton className="mt-6" />}
        </PageHeader>
      )}
    </PageHeroFrame>
  );
};
