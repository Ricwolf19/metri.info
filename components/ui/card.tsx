import { cn } from "@/lib/utils";

/** shadcn-style card primitives, themed with Metri's ink tokens. */
export const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-card border border-ink-600 bg-ink-800 text-ink-50",
      className,
    )}
    {...props}
  />
);

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);
