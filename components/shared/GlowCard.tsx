import { cn } from "@/lib/utils";

/** Elevated card with a gradient hairline border + lime glow on hover.
 * Web equivalent of the mobile app's Card with shadow. */
export const GlowCard = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "group relative overflow-hidden rounded-card border border-ink-600 bg-ink-800 p-6 transition-all duration-300 hover:border-lime-400/40 hover:shadow-[0_0_40px_-12px_rgba(190,248,43,0.25)]",
      className,
    )}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-lime-400/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    />
    {children}
  </div>
);
