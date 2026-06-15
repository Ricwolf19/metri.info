import { cn } from "@/lib/utils";

/** Elevated card with a hairline border that lifts on hover. */
export const GlowCard = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "group relative overflow-hidden rounded-card border border-ink-600 bg-ink-800 p-6 transition-all duration-300 hover:border-ink-500 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]",
      className,
    )}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-ink-50/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    />
    {children}
  </div>
);
