import { cn } from "@/lib/utils";

/** Themed multiline input — matches `Input` styling. */
export const Textarea = ({
  className,
  ...props
}: React.ComponentProps<"textarea">) => (
  <textarea
    data-slot="textarea"
    className={cn(
      "min-h-28 w-full rounded-field border border-ink-600 bg-ink-900 px-4 py-3 text-sm text-ink-50 transition-colors",
      "placeholder:text-ink-400",
      "focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none",
      "aria-invalid:border-red-500/70 aria-invalid:ring-red-500/20",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    {...props}
  />
);
