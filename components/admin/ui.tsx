import { formatMetric, type MetricFormat } from "@/lib/analytics/format";
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

/** Headline metric card — a label over a large monospaced number, and an
 * optional quiet line under it. `null` renders an em-dash so an unconfigured
 * or silent source degrades cleanly. */
export const Stat = ({
  label,
  value,
  format,
  hint,
}: {
  label: string;
  value: number | null;
  format?: MetricFormat;
  hint?: string;
}) => (
  <div className="min-w-0 rounded-card border border-ink-600 bg-ink-800 p-5">
    <p className="text-sm text-ink-400">{label}</p>
    <p className="mt-1 font-mono text-3xl font-bold text-ink-50">
      {value === null ? "—" : formatMetric(value, format)}
    </p>
    {hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
  </div>
);

/** Titled surface for charts and grouped figures. */
export const Card = ({
  title,
  subtitle,
  aside,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Beside the title, e.g. a source badge. */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={cn(
      "min-w-0 rounded-card border border-ink-600 bg-ink-800 p-5",
      className,
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <h2 className="text-sm font-semibold text-ink-100">{title}</h2>
      {aside}
    </div>
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
