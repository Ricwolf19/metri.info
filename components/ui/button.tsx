import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * shadcn-style button — owned in-repo and themed with METRI's ink/accent tokens
 * (not shadcn's --background palette). Export `buttonVariants` so links can be
 * styled as buttons: `<Link className={buttonVariants({ variant: "outline" })}>`.
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ink-500/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ink-50 text-ink-900 hover:bg-ink-200",
        secondary:
          "border border-ink-600 bg-ink-800 text-ink-50 hover:bg-ink-700",
        outline: "border border-ink-600 text-ink-100 hover:bg-ink-800",
        ghost: "text-ink-200 hover:bg-ink-800 hover:text-ink-50",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = ({ className, variant, size, ...props }: ButtonProps) => (
  <button
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  />
);
