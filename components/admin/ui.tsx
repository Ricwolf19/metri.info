import { cn } from "@/lib/utils";

/** Section page header — title plus a short description. Consistent across every
 * admin section. */
export const PageHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <header className="mb-8">
    <h1 className="text-2xl font-bold text-ink-50">{title}</h1>
    <p className="mt-1 max-w-2xl text-sm text-ink-300">{description}</p>
  </header>
);

const fmt = (n: number) => n.toLocaleString("en-US");

/** Headline metric card — a label over a large monospaced number. `null` renders
 * an em-dash so an unconfigured source degrades cleanly. */
export const Stat = ({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) => (
  <div className="rounded-card border border-ink-600 bg-ink-800 p-5">
    <p className="text-sm text-ink-400">{label}</p>
    <p className="mt-1 font-mono text-3xl font-bold text-ink-50">
      {value === null ? "—" : fmt(value)}
    </p>
  </div>
);

/** Titled surface for charts and grouped figures. */
export const Card = ({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={cn(
      "rounded-card border border-ink-600 bg-ink-800 p-5",
      className,
    )}
  >
    <h3 className="text-sm font-semibold text-ink-100">{title}</h3>
    {subtitle ? (
      <p className="mt-0.5 text-xs text-ink-400">{subtitle}</p>
    ) : null}
    <div className="mt-4">{children}</div>
  </section>
);

export const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-ink-400">{children}</p>
);

export { fmt };
