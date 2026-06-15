import { cn } from "@/lib/utils";

/** Small inline tag used inside MDX: <MuscleBadge>chest</MuscleBadge> */
export const MuscleBadge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "mr-1 inline-flex items-center rounded-md border border-ink-600 bg-ink-700 px-2 py-0.5 text-xs font-medium text-accent",
      className,
    )}
  >
    {children}
  </span>
);
