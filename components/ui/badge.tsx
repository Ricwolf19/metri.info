import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** shadcn-style badge / pill, themed with METRI's ink/accent tokens. */
export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border border-ink-600 bg-ink-700 text-accent",
        outline: "border border-ink-600 text-ink-300",
        solid: "bg-ink-50 text-ink-900",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
