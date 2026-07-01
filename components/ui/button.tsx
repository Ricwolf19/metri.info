import { cva, type VariantProps } from "class-variance-authority";

import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

/**
 * shadcn-style button — owned in-repo and themed with Metri's ink/accent tokens
 * (not shadcn's --background palette). Export `buttonVariants` so links can be
 * styled as buttons: `<Link className={buttonVariants({ variant: "outline" })}>`.
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-field font-semibold whitespace-nowrap transition-[color,background-color,border-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 focus-visible:outline-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ink-50 text-ink-900 hover:bg-ink-200",
        brand: "bg-brand text-brand-contrast hover:bg-brand/90",
        // `text-ink-50` already inverts per theme (near-white on dark, near-black
        // on light) — do NOT override it with `light:text-ink-900`, which in
        // light mode resolves to the near-white app background and paints
        // white-on-light-grey. Only the surface/border get light overrides.
        secondary:
          "border border-ink-600 bg-ink-800 text-ink-50 hover:border-ink-500 hover:bg-ink-700 light:border-ink-500 light:bg-ink-700 light:hover:bg-ink-600",
        outline:
          "border border-ink-600 text-ink-100 hover:border-ink-500 hover:bg-ink-800",
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
  VariantProps<typeof buttonVariants> & {
    /** Show a leading spinner and disable the button while a request is in flight. */
    loading?: boolean;
  };

export const Button = ({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) => (
  <button
    className={cn(buttonVariants({ variant, size }), className)}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...props}
  >
    {loading ? <Spinner size="sm" /> : null}
    {children}
  </button>
);
