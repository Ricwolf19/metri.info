import { cn } from "@/lib/utils";

/** Themed text input — ink tokens, swaps with the active theme. */
export const Input = ({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) => (
  <input
    type={type}
    data-slot="input"
    className={cn(
      "h-11 w-full rounded-field border border-ink-600 bg-ink-900 px-4 text-sm text-ink-50 transition-colors",
      "placeholder:text-ink-400",
      "focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none",
      "aria-invalid:border-red-500/70 aria-invalid:ring-red-500/20",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    {...props}
  />
);
